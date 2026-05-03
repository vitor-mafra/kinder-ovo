/**
 * Gera hero-kinder-ovo.png com alpha a partir de hero-kinder-ovo.jpg:
 * típico de export com "remoção de fundo" que voltou só JPEG chapado em preto.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const JPG = path.join(ROOT, "public", "hero-kinder-ovo.jpg");
const PNG = path.join(ROOT, "public", "hero-kinder-ovo.png");

/* Pixels muito escuros e pouco saturados ⇒ fundo; chocolate mantém pelo menos uma componente forte. */
const MAX_RGB_BG = Number(process.env.HERO_TRIM_MAX_RGB ?? "34");
const LUM_BG_CAP = Number(process.env.HERO_TRIM_LUM_CAP ?? "30");
const SAT_BG_CAP = Number(process.env.HERO_TRIM_SAT_CAP ?? "22");

async function main() {
  if (!fs.existsSync(JPG)) {
    console.error("Missing", JPG);
    process.exit(1);
  }

  const pipeline = sharp(JPG);
  let { data, info } = await pipeline
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const stride = info.channels === 4 ? 4 : 3;

  const out = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * stride;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const mn = Math.min(r, g, b);
      const mx = Math.max(r, g, b);
      const lum = (r + g + b) / 3;
      const sat = mx - mn;

      const killBg =
        mx <= MAX_RGB_BG || (lum < LUM_BG_CAP && sat < SAT_BG_CAP);
      const oj = (y * w + x) * 4;
      out[oj] = r;
      out[oj + 1] = g;
      out[oj + 2] = b;
      out[oj + 3] = killBg ? 0 : 255;
    }
  }

  await sharp(out, {
    raw: {
      width: w,
      height: h,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(PNG);

  console.warn("Wrote", PNG);
}

await main();
