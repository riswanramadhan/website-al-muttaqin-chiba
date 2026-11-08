// Membuat gambar placeholder SVG (galeri, QRIS, OG) tanpa dependensi.
// Jalankan: node scripts/generate-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const galleryDir = join(root, "public", "images", "gallery");
mkdirSync(galleryDir, { recursive: true });

const star = (x, y, r, color) => {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.62;
    pts.push(`${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="1.2"/>`;
};

const pattern = (w, h, color) => {
  let out = "";
  for (let y = 48; y < h; y += 96) {
    for (let x = 48; x < w; x += 96) out += star(x, y, 34, color);
  }
  return out;
};

const labels = [
  ["01", "Prayer hall", 1200, 800],
  ["02", "Study circle", 1200, 900],
  ["03", "Open Mosque Day", 1200, 800],
  ["04", "Children's Quran class", 1200, 1200],
  ["05", "Mosque exterior", 1200, 800],
  ["06", "Iftar", 1200, 900],
];

for (const [name, label, w, h] of labels) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a0a0a"/>
      <stop offset="1" stop-color="#4a1111"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g opacity="0.35">${pattern(w, h, "#ffffff")}</g>
  <rect x="${w / 2 - 260}" y="${h / 2 - 44}" width="520" height="88" rx="24" fill="#0a0a0a" fill-opacity="0.55"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Plus Jakarta Sans, Noto Sans JP, sans-serif" font-size="34" fill="#ffffff">${label}</text>
  <text x="50%" y="${h / 2 + 70}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="18" fill="#ffffff" fill-opacity="0.7">Placeholder: foto resmi menyusul</text>
</svg>`;
  writeFileSync(join(galleryDir, `${name}.svg`), svg, "utf8");
  console.log("gallery:", name);
}

// QRIS placeholder
const q = 29;
const cell = 10;
let modules = "";
let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
for (let y = 0; y < q; y++) {
  for (let x = 0; x < q; x++) {
    const finder = (x < 7 && y < 7) || (x >= q - 7 && y < 7) || (x < 7 && y >= q - 7);
    let on = false;
    if (finder) {
      const fx = x < 7 ? x : x - (q - 7);
      const fy = y < 7 ? y : y - (q - 7);
      on = fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
    } else on = rnd() > 0.55;
    if (on) modules += `<rect x="${40 + x * cell}" y="${40 + y * cell}" width="${cell}" height="${cell}"/>`;
  }
}
const qris = `<svg xmlns="http://www.w3.org/2000/svg" width="${q * cell + 80}" height="${q * cell + 130}" viewBox="0 0 ${q * cell + 80} ${q * cell + 130}">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g fill="#0a0a0a">${modules}</g>
  <text x="50%" y="${q * cell + 80}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="22" font-weight="700" fill="#0a0a0a">QRIS</text>
  <text x="50%" y="${q * cell + 108}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" fill="#7f1d1d">Placeholder: ganti dengan QRIS resmi masjid</text>
</svg>`;
mkdirSync(join(root, "public", "images"), { recursive: true });
writeFileSync(join(root, "public", "images", "qris-placeholder.svg"), qris, "utf8");
console.log("qris placeholder written");
