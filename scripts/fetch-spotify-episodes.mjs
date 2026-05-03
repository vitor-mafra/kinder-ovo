#!/usr/bin/env node
// Resolves Spotify episode IDs for the show and writes src/data/spotify-episodes.json.
// Reads SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET from env (or site/.env).
//
// Match strategy, in order:
//   1. By "#N:" episode number (both titles have it).
//   2. By normalized title equality.
//   3. By release date within ±2 days of episodes.json publishedAt.
// If none match, the episode is omitted (the UI falls back to the search URL).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, "..");
const SHOW_ID = "04bTe3UuVaZVDKV9ORFN4Y";
const MARKET = "BR";
const EPISODES_PATH = resolve(SITE_ROOT, "src/data/episodes.json");
const OUT_PATH = resolve(SITE_ROOT, "src/data/spotify-episodes.json");
const ENV_PATH = resolve(SITE_ROOT, ".env");

function loadDotEnv() {
  if (!existsSync(ENV_PATH)) return;
  const text = readFileSync(ENV_PATH, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function normalizeTitle(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^#\d+\s*[:\-–—]\s*/, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNumber(title) {
  const m = title.match(/^#(\d+)\s*[:\-–—]/);
  return m ? Number(m[1]) : null;
}

function dayDiff(aIso, bIso) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.abs(a - b) / 86400000;
}

async function getToken(clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function fetchAllEpisodes(token) {
  const items = [];
  let url = `https://api.spotify.com/v1/shows/${SHOW_ID}/episodes?limit=50&market=${MARKET}`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      throw new Error(`Spotify episodes request failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    for (const ep of data.items) {
      if (!ep) continue;
      items.push({
        id: ep.id,
        name: ep.name,
        release_date: ep.release_date,
      });
    }
    url = data.next;
  }
  return items;
}

function buildMapping(localEpisodes, spotifyEpisodes) {
  const byNumber = new Map();
  const byNormTitle = new Map();
  for (const sp of spotifyEpisodes) {
    const num = extractNumber(sp.name);
    if (num !== null && !byNumber.has(num)) byNumber.set(num, sp);
    const norm = normalizeTitle(sp.name);
    if (norm) {
      const list = byNormTitle.get(norm) || [];
      list.push(sp);
      byNormTitle.set(norm, list);
    }
  }

  const mapping = {};
  const stats = { byNumber: 0, byTitle: 0, byDate: 0, missed: 0, missedSamples: [] };

  for (const ep of localEpisodes) {
    const num = extractNumber(ep.title);
    let hit = null;

    if (num !== null && byNumber.has(num)) {
      hit = byNumber.get(num);
      stats.byNumber++;
    } else {
      const norm = normalizeTitle(ep.title);
      const candidates = byNormTitle.get(norm);
      if (candidates && candidates.length === 1) {
        hit = candidates[0];
        stats.byTitle++;
      } else if (candidates && candidates.length > 1 && ep.publishedAt) {
        let best = null;
        let bestDiff = Infinity;
        for (const c of candidates) {
          const d = dayDiff(c.release_date, ep.publishedAt);
          if (d < bestDiff) {
            bestDiff = d;
            best = c;
          }
        }
        if (best && bestDiff <= 2) {
          hit = best;
          stats.byTitle++;
        }
      }

      if (!hit && ep.publishedAt) {
        let best = null;
        let bestDiff = Infinity;
        for (const sp of spotifyEpisodes) {
          const d = dayDiff(sp.release_date, ep.publishedAt);
          if (d < bestDiff) {
            bestDiff = d;
            best = sp;
          }
        }
        if (best && bestDiff <= 2) {
          hit = best;
          stats.byDate++;
        }
      }
    }

    if (hit) {
      mapping[String(ep.id)] = hit.id;
    } else {
      stats.missed++;
      if (stats.missedSamples.length < 8) {
        stats.missedSamples.push(`${ep.publishedAt?.slice(0, 10)} | ${ep.title}`);
      }
    }
  }

  return { mapping, stats };
}

async function main() {
  loadDotEnv();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn(
      "[spotify] SPOTIFY_CLIENT_ID/SECRET not set — skipping. " +
        "UI will fall back to search URLs.",
    );
    if (!existsSync(OUT_PATH)) writeFileSync(OUT_PATH, "{}\n");
    return;
  }

  const localEpisodes = JSON.parse(readFileSync(EPISODES_PATH, "utf8"));
  console.log(`[spotify] fetching episodes for show ${SHOW_ID}...`);
  const token = await getToken(clientId, clientSecret);
  const spotifyEpisodes = await fetchAllEpisodes(token);
  console.log(`[spotify] received ${spotifyEpisodes.length} episodes from Spotify`);

  const { mapping, stats } = buildMapping(localEpisodes, spotifyEpisodes);
  writeFileSync(OUT_PATH, JSON.stringify(mapping, null, 2) + "\n");

  console.log(
    `[spotify] matched: byNumber=${stats.byNumber} byTitle=${stats.byTitle} byDate=${stats.byDate} missed=${stats.missed} (total local: ${localEpisodes.length})`,
  );
  if (stats.missed) {
    console.log("[spotify] sample of unmatched (will fall back to search):");
    for (const s of stats.missedSamples) console.log("  -", s);
  }
}

main().catch((err) => {
  console.error("[spotify] failed:", err);
  process.exit(1);
});
