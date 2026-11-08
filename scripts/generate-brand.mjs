// Membuat aset logo & ikon PWA dari logo resmi (`logo transparan.png` di root proyek, 1080x1080, transparan).
// Jalankan: node scripts/generate-brand.mjs
// Hasil:
//   public/images/brand/logo-full.png        logo lengkap (kubah + tulisan), dipangkas
//   public/images/brand/logo-mark.png        kubah saja, warna asli maroon
//   public/images/brand/logo-mark-light.png  kubah saja, warna cream untuk latar gelap
//   public/icons/*.png, src/app/favicon.ico  ikon PWA/favicon (kubah maroon di atas cream)
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "logo transparan.png");
const brandDir = join(root, "public", "images", "brand");
const iconDir = join(root, "public", "icons");
mkdirSync(brandDir, { recursive: true });
mkdirSync(iconDir, { recursive: true });

const CREAM = { r: 255, g: 245, b: 230, alpha: 1 };

// Logo lengkap, dipangkas.
const full = await sharp(src).trim({ threshold: 1 }).png().toBuffer();
await sharp(full).resize({ width: 960 }).png({ compressionLevel: 9 }).toFile(join(brandDir, "logo-full.png"));

// Kubah saja: bagian atas sampai sebelum tulisan (y < 815), lalu pangkas.
const top = await sharp(src).extract({ left: 0, top: 0, width: 1080, height: 815 }).png().toBuffer();
const mark = await sharp(top).trim({ threshold: 1 }).png().toBuffer();
const markMeta = await sharp(mark).metadata();
console.log("mark", markMeta.width, markMeta.height);
await sharp(mark).resize({ height: 256 }).png({ compressionLevel: 9 }).toFile(join(brandDir, "logo-mark.png"));

// Versi terang: ganti warna menjadi cream, alfa dipertahankan.
const { data, info } = await sharp(mark).resize({ height: 256 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  data[i] = CREAM.r;
  data[i + 1] = CREAM.g;
  data[i + 2] = CREAM.b;
}
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(join(brandDir, "logo-mark-light.png"));

// Ikon persegi: kubah di tengah kanvas cream dengan padding.
async function squareIcon(size, padRatio, rounded) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const markImg = await sharp(mark).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  let base = sharp({ create: { width: size, height: size, channels: 4, background: CREAM } }).composite([{ input: markImg, gravity: "center" }]);
  let buf = await base.png().toBuffer();
  if (rounded) {
    const r = Math.round(size * 0.22);
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`);
    buf = await sharp(buf).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  }
  return buf;
}

const targets = [
  { file: "icon-192.png", size: 192, pad: 0.14, rounded: true },
  { file: "icon-512.png", size: 512, pad: 0.14, rounded: true },
  { file: "icon-maskable-192.png", size: 192, pad: 0.22, rounded: false },
  { file: "icon-maskable-512.png", size: 512, pad: 0.22, rounded: false },
  { file: "apple-touch-icon.png", size: 180, pad: 0.16, rounded: false },
  { file: "favicon-32.png", size: 32, pad: 0.06, rounded: true },
  { file: "favicon-16.png", size: 16, pad: 0.04, rounded: true },
];
for (const t of targets) {
  const buf = await squareIcon(t.size, t.pad, t.rounded);
  writeFileSync(join(iconDir, t.file), buf);
  console.log("icon:", t.file);
}

// SVG ikon (dipakai metadata `icons`): bungkus PNG 512 agar tetap satu sumber.
const png512 = await squareIcon(512, 0.14, true);
writeFileSync(
  join(iconDir, "icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><image width="512" height="512" xlink:href="data:image/png;base64,${png512.toString("base64")}"/></svg>\n`,
);
const pngMask = await squareIcon(512, 0.22, false);
writeFileSync(
  join(iconDir, "icon-maskable.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><image width="512" height="512" xlink:href="data:image/png;base64,${pngMask.toString("base64")}"/></svg>\n`,
);

// favicon.ico (payload PNG 32px)
writeFileSync(join(root, "src", "app", "favicon.ico"), await squareIcon(32, 0.06, true));
console.log("done");
