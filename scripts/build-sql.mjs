/**
 * Membangun berkas SQL untuk Supabase dari sumber di repo:
 *   supabase/seed.sql       data awal (konten contoh di src/data) agar situs tidak kosong
 *   supabase/setup-all.sql  SATU berkas siap tempel di SQL Editor: migrasi 0001-0003 (dibuat
 *                           idempoten), seed, dan akun admin pertama
 * Jalankan: pnpm db:sql (ulang setiap kali migrasi atau data seed berubah).
 */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const supabaseDir = path.join(root, "supabase");

/** Muat data seed TypeScript lewat esbuild (alias @/ dibaca dari tsconfig.json). */
async function loadSeed() {
  const dir = await mkdtemp(path.join(tmpdir(), "acc-seed-"));
  const outfile = path.join(dir, "seed.mjs");
  const modules = ["profile", "prayer-config", "announcements", "events", "lectures", "news", "donations", "faq", "gallery", "halal", "programs", "promo"];
  try {
    await build({
      stdin: { contents: modules.map((m) => `export * from "./src/data/${m}";`).join("\n"), resolveDir: root, loader: "ts" },
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Literal SQL
// ---------------------------------------------------------------------------
const text = (value) => (value === null || value === undefined || value === "" ? "null" : `'${String(value).replace(/'/g, "''")}'`);
const json = (value) => (value === null || value === undefined ? "null" : `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`);
const bool = (value) => (value ? "true" : "false");
const int = (value) => String(Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0);
const textArray = (values) => (values && values.length ? `array[${values.map(text).join(", ")}]::text[]` : "'{}'::text[]");

function insert(table, columns, rows, conflict) {
  if (rows.length === 0) return `-- ${table}: tidak ada data seed\n`;
  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  return `insert into ${table} (${columns.join(", ")}) values\n${values}\non conflict ${conflict} do nothing;\n`;
}

const KEY = /^[a-z0-9][a-z0-9-]{0,79}$/;

/** Baris content_items dari daftar seed; `id` menjadi item_key dan tidak ikut disimpan di data. */
function collectionRows(collection, items) {
  return items.map((item, index) => {
    const { id, ...data } = item;
    const key = typeof id === "string" && id ? id : `item-${String(index + 1).padStart(2, "0")}`;
    if (!KEY.test(key)) throw new Error(`Kunci item tidak valid untuk ${collection}: "${key}"`);
    return [text(collection), text(key), json(data), int(index), "true"];
  });
}

function buildSeed(seed) {
  const parts = [];
  parts.push(
    "-- Data awal Al Muttaqin Cultural Center. DIBUAT OTOMATIS oleh scripts/build-sql.mjs dari src/data/*.",
    "-- Jangan diubah manual; ubah data seed lalu jalankan `pnpm db:sql`.",
    "-- Aman dijalankan ulang: baris yang sudah ada tidak ditimpa (on conflict do nothing), jadi",
    "-- perubahan yang sudah dibuat admin lewat panel tidak hilang.",
    "",
  );

  parts.push("-- Konfigurasi salat");
  parts.push(insert("prayer_config", ["id", "config"], [["1", json(seed.prayerConfig)]], "(id)"));

  parts.push("-- Pengaturan situs: profil & kontak, video unggulan, pop-up promo");
  parts.push(
    insert(
      "site_settings",
      ["key", "value"],
      [
        [text("profile"), json(seed.profile)],
        [text("featured_video"), json(seed.documentary)],
        [text("promo_popup"), json(seed.promoPopup)],
      ],
      "(key)",
    ),
  );

  parts.push("-- Pengumuman");
  parts.push(
    insert(
      "announcements",
      ["slug", "title", "excerpt", "body", "category", "pinned", "status", "published_at", "expires_at"],
      seed.announcements.map((a) => [text(a.slug), json(a.title), json(a.excerpt), json(a.body), text(a.category), bool(a.pinned), "'published'", text(a.publishedAt), text(a.expiresAt)]),
      "(slug)",
    ),
  );

  parts.push("-- Agenda (jumlah pendaftar dihitung otomatis oleh trigger, jadi tidak ikut di-seed)");
  parts.push(
    insert(
      "events",
      ["slug", "title", "excerpt", "description", "category", "starts_at", "ends_at", "location", "speaker", "languages", "cover_image", "registration", "recurring", "featured", "status"],
      seed.events.map((e) => {
        const registration = { ...e.registration };
        delete registration.registered;
        return [
          text(e.slug),
          json(e.title),
          json(e.excerpt),
          json(e.description),
          text(e.category),
          text(e.startsAt),
          text(e.endsAt),
          json(e.location),
          text(e.speaker),
          textArray(e.languages),
          text(e.coverImage),
          json(registration),
          json(e.recurring ?? null),
          bool(e.featured),
          "'published'",
        ];
      }),
      "(slug)",
    ),
  );

  parts.push("-- Jadwal Jumat");
  parts.push(
    insert(
      "jumuah_schedules",
      ["date", "khatib", "imam", "time", "language", "topic", "note", "published"],
      seed.jumuahSchedules.map((j) => [text(j.date), text(j.khatib), text(j.imam), text(j.time), text(j.language), json(j.topic ?? null), json(j.note ?? null), "true"]),
      "(date)",
    ),
  );

  parts.push("-- Kajian video");
  parts.push(
    insert(
      "lectures",
      ["slug", "title", "speaker", "youtube_id", "published_at", "duration_minutes", "series", "description", "language", "tags", "status"],
      seed.lectures.map((l) => [text(l.slug), json(l.title), text(l.speaker), text(l.youtubeId), text(l.publishedAt), int(l.durationMinutes), json(l.series ?? null), json(l.description), text(l.language), textArray(l.tags), "'published'"]),
      "(slug)",
    ),
  );

  parts.push("-- Berita");
  parts.push(
    insert(
      "news",
      ["slug", "title", "excerpt", "body", "category", "author", "cover_image", "tags", "status", "published_at"],
      seed.news.map((n) => [text(n.slug), json(n.title), json(n.excerpt), json(n.body), text(n.category), text(n.author), text(n.coverImage), textArray(n.tags), "'published'", text(n.publishedAt)]),
      "(slug)",
    ),
  );

  const collections = [
    ["faqs", seed.faqs],
    ["gallery", seed.gallery],
    ["donation_accounts", seed.donationAccounts],
    ["donation_programs", seed.donationPrograms],
    ["transparency_reports", seed.transparencyReports],
    ["programs", seed.programs],
    ["rooms", seed.rooms],
    ["halal_places", seed.halalPlaces],
    ["board", seed.board],
    ["facilities", seed.facilities],
    ["timeline", seed.timeline],
  ];
  for (const [name, items] of collections) {
    parts.push(`-- Koleksi: ${name} (${items.length} item)`);
    parts.push(insert("content_items", ["collection", "item_key", "data", "sort_order", "published"], collectionRows(name, items), "(collection, item_key)"));
  }
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Migrasi lama (0001, 0002) dibuat idempoten agar setup-all.sql aman dijalankan ulang.
// ---------------------------------------------------------------------------
function makeIdempotent(sql) {
  return sql
    .replace(/^create type (\w+) as enum \(([^;]+)\);$/gm, (_m, name, values) => `do $$ begin\n  create type ${name} as enum (${values});\nexception when duplicate_object then null;\nend $$;`)
    .replace(/^create policy ("[^"]+") on ([\w.]+)/gm, (_m, name, table) => `drop policy if exists ${name} on ${table};\ncreate policy ${name} on ${table}`);
}

const banner = (title) => `\n-- ${"=".repeat(74)}\n-- ${title}\n-- ${"=".repeat(74)}\n`;

async function main() {
  const seed = await loadSeed();
  const seedSql = buildSeed(seed);
  await writeFile(path.join(supabaseDir, "seed.sql"), seedSql);

  const read = (file) => readFile(path.join(supabaseDir, file), "utf8");
  const [init, admin, cms, adminUser] = await Promise.all([read("migrations/0001_init.sql"), read("migrations/0002_admin.sql"), read("migrations/0003_cms.sql"), read("admin-user.sql")]);

  const all = [
    "-- Al Muttaqin Cultural Center: penyiapan database Supabase dalam SATU berkas.",
    "-- DIBUAT OTOMATIS oleh scripts/build-sql.mjs. Jangan diubah manual.",
    "--",
    "-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel seluruh isi berkas ini > Run.",
    "-- PROYEK BARU: sebelum Run, cari GANTI_KATA_SANDI_AWAL di bagian 5/5 dan ganti dengan kata sandi awal",
    "-- admin pilihan Anda (minimal 8 karakter). Bila akun admin sudah ada, bagian itu tidak perlu diubah.",
    "-- Aman dijalankan ulang kapan saja; data yang sudah diubah admin tidak ditimpa.",
    "-- Isi: (1) skema + RLS, (2) kolom panel admin, (3) CMS + storage, (4) data awal, (5) akun admin.",
    banner("1/5  Skema awal dan RLS (migrations/0001_init.sql)"),
    makeIdempotent(init),
    banner("2/5  Panel admin (migrations/0002_admin.sql)"),
    makeIdempotent(admin),
    banner("3/5  CMS, hitungan pendaftar, storage (migrations/0003_cms.sql)"),
    cms,
    banner("4/5  Data awal (seed.sql)"),
    seedSql,
    banner("5/5  Akun admin pertama (admin-user.sql)"),
    adminUser,
  ].join("\n");
  await writeFile(path.join(supabaseDir, "setup-all.sql"), all);

  const kb = (value) => `${Math.round(Buffer.byteLength(value) / 1024)} KB`;
  console.log(`supabase/seed.sql       ${kb(seedSql)}`);
  console.log(`supabase/setup-all.sql  ${kb(all)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
