// Membuat ikon PWA (PNG) dari public/icons/icon.svg memakai sharp.
// Jalankan: npm run icons
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(join(outDir, "icon.svg"));
const maskable = readFileSync(join(outDir, "icon-maskable.svg"));

const targets = [
  { file: "icon-192.png", size: 192, src: svg },
  { file: "icon-512.png", size: 512, src: svg },
  { file: "icon-maskable-192.png", size: 192, src: maskable },
  { file: "icon-maskable-512.png", size: 512, src: maskable },
  { file: "apple-touch-icon.png", size: 180, src: maskable },
  { file: "favicon-32.png", size: 32, src: svg },
  { file: "favicon-16.png", size: 16, src: svg },
];

for (const t of targets) {
  await sharp(t.src).resize(t.size, t.size).png().toFile(join(outDir, t.file));
  console.log("icon:", t.file);
}

// favicon.ico untuk src/app (Next menyajikan sebagai /favicon.ico)
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const { writeFileSync } = await import("node:fs");
writeFileSync(join(root, "src", "app", "favicon.ico"), png32);
console.log("favicon.ico written (PNG payload)");
