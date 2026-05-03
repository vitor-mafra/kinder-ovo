/**
 * Troca o fundo preto (conectado à borda) por branco em pinguim-colaborador.png.
 * Limiar baixo preserva o preto do desenho no interior.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC = path.join(__dirname, "../public/guests/pinguim-colaborador.png");
const THRESHOLD = 12; // soma R+G+B; só percorre pixels tão escuros quanto o fundo

async function main() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;
  if (ch !== 3) {
    console.error("Esperado RGB 3 canais, veio:", ch);
    process.exit(1);
  }

  const stride = w * ch;
  const idx = (x, y) => y * stride + x * ch;
  const isWall = (x, y) => {
    const i = idx(x, y);
    return data[i] + data[i + 1] + data[i + 2] > THRESHOLD;
  };

  const vis = new Uint8Array(w * h);
  const q = [];
  const push = (x, y) => {
    const k = y * w + x;
    if (vis[k]) return;
    if (isWall(x, y)) return;
    vis[k] = 1;
    q.push(k);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  let qi = 0;
  while (qi < q.length) {
    const k = q[qi++];
    const x = k % w;
    const y = (k / w) | 0;
    const i = idx(x, y);
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;

    const nbs = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of nbs) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const nk = ny * w + nx;
      if (vis[nk]) continue;
      if (isWall(nx, ny)) continue;
      vis[nk] = 1;
      q.push(nk);
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 3 },
  })
    .png()
    .toFile(SRC);

  const filled = vis.reduce((a, b) => a + b, 0);
  console.log(`Atualizado ${SRC} — ${filled} pixels pintados de branco (threshold ${THRESHOLD}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
