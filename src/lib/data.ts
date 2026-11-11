import episodesRaw from "../data/episodes.json";
import rankingsRaw from "../data/rankings.json";
import spotifyMap from "../data/spotify-episodes.json";

export const base = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL;

export const SHOW_URL = "https://open.spotify.com/show/04bTe3UuVaZVDKV9ORFN4Y";

export interface Panelist {
  name: string;
  short: string;
  slug: string;
  color: string;
  profile: string;
}

/** Bancada fixa. A cor acompanha a pessoa em todos os gráficos da página. */
export const PANELISTS: Panelist[] = [
  { name: "José Roberto de Toledo", short: "Toledo", slug: "jose-roberto-de-toledo", color: "#33302e", profile: "https://x.com/zerotoledo" },
  { name: "Fernando de Barros e Silva", short: "Fernando", slug: "fernando-de-barros-e-silva", color: "#eda100", profile: "https://x.com/fernandobarros" },
  { name: "Celso Rocha de Barros", short: "Celso", slug: "celso-rocha-de-barros", color: "#2a78d6", profile: "https://x.com/NPTO" },
  { name: "Thais Bilenky", short: "Thais", slug: "thais-bilenky", color: "#eb6834", profile: "https://x.com/thais_bilenky" },
  { name: "Malu Gaspar", short: "Malu", slug: "malu-gaspar", color: "#1baf7a", profile: "https://x.com/malugaspar" },
  { name: "Ana Clara Costa", short: "Ana Clara", slug: "ana-clara-costa", color: "#e87ba4", profile: "https://x.com/anaclaracosta" },
];

export const PANELIST_BY_NAME: Record<string, Panelist> = Object.fromEntries(
  PANELISTS.map((p) => [p.name, p])
);

export const GUEST_COLOR = "#8a7466";

export const GUESTS: Record<string, { image: string; profile: string }> = {
  "Bernardo Esteves": { image: "bernardo-esteves.png", profile: "https://x.com/besteves" },
  "Marina Dias": { image: "pinguim-colaborador.png", profile: "https://x.com/falamarina" },
  "Thaís Oyama": { image: "thais-oyama.png", profile: "https://pt.wikipedia.org/wiki/Tha%C3%ADs_Oyama" },
  "Bernardo Mello Franco": { image: "pinguim-colaborador.png", profile: "https://x.com/BernardoMF" },
  "Luigi Maza": { image: "luigi-maza.png", profile: "https://x.com/LuigiMazzza" },
};

export function portrait(name: string): string | null {
  const p = PANELIST_BY_NAME[name];
  if (p) return `${base}/avatars/${p.slug}.png`;
  const g = GUESTS[name];
  if (g) return `${base}/guests/${g.image}`;
  return null;
}

export function shortName(name: string): string {
  return PANELIST_BY_NAME[name]?.short ?? name;
}

export interface Ranking {
  name: string;
  appearances: number;
  wins: number;
  isMainPanelist: boolean;
  winRate: number;
}

export const rankings = rankingsRaw as Ranking[];

/** 38.6 -> "38,6" */
export function pt(n: number, digits = 1): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: digits });
}

const spotifyById = spotifyMap as Record<string, string>;

function spotifyUrl(id: number, title: string): string {
  const sid = spotifyById[String(id)];
  return sid
    ? `https://open.spotify.com/episode/${sid}`
    : `https://open.spotify.com/search/${encodeURIComponent(title)}`;
}

const MONTHS = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];

export function formatDate(iso: string): string {
  // As datas vêm com fuso de Brasília; lemos direto do texto para não depender do fuso do build.
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export interface Ep {
  /** posição na lista cronológica de episódios com Kinder Ovo */
  i: number;
  id: number;
  n: number | null;
  title: string;
  iso: string;
  year: number;
  date: string;
  figure: string | null;
  figures: string[];
  winners: string[];
  participants: string[];
  url: string;
}

/** Todos os episódios com Kinder Ovo, em ordem cronológica. */
export const EPS: Ep[] = [...episodesRaw]
  .filter((e) => e.hasKinderOvo)
  .sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
  .map((e, i) => ({
    i,
    id: e.id,
    n: e.episodeNumber ?? null,
    title: e.title,
    iso: e.publishedAt,
    year: Number(e.publishedAt.slice(0, 4)),
    date: formatDate(e.publishedAt),
    figure: e.publicFigure ?? null,
    figures: (e.publicFigure ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean),
    winners: e.winners ?? [],
    participants: e.participants ?? [],
    url: spotifyUrl(e.id, e.title),
  }));

/** Versão enxuta que vai para o navegador (tooltip dos ovos). */
export const EPS_CLIENT = EPS.map((e) => ({
  n: e.n,
  t: e.title,
  d: e.date,
  f: e.figure,
  w: e.winners,
  u: e.url,
}));

/** Divide uma lista em grupos de `size` (os ovos são contados de dez em dez). */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Maior sequência de acertos seguidos, contando só os episódios em que a pessoa estava. */
export function longestStreak(name: string): { length: number; from: Ep; to: Ep } | null {
  let best: { length: number; from: Ep; to: Ep } | null = null;
  let cur = 0;
  let start: Ep | null = null;
  for (const e of EPS) {
    if (!e.participants.includes(name)) continue;
    if (e.winners.includes(name)) {
      if (cur === 0) start = e;
      cur++;
      if (!best || cur > best.length) best = { length: cur, from: start!, to: e };
    } else {
      cur = 0;
    }
  }
  return best;
}
