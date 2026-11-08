import type { HijriImportantDate } from "@/lib/types";

/** Tanggal penting kalender Hijriah (bulan 1-12). */
export const hijriImportantDates: HijriImportantDate[] = [
  { id: "muharram-1", month: 1, day: 1, kind: "other", title: { ja: "ヒジュラ暦の新年", en: "Islamic New Year", id: "Tahun Baru Hijriah" } },
  { id: "tasua", month: 1, day: 9, kind: "fast", title: { ja: "タースーアーの断食", en: "Fast of Tasu'a", id: "Puasa Tasu'a" } },
  { id: "ashura", month: 1, day: 10, kind: "fast", title: { ja: "アーシューラーの断食", en: "Fast of Ashura", id: "Puasa Asyura" } },
  { id: "maulid", month: 3, day: 12, kind: "other", title: { ja: "預言者生誕の日（マウリド）", en: "Mawlid an-Nabi", id: "Maulid Nabi" } },
  { id: "rajab-1", month: 7, day: 1, kind: "other", title: { ja: "ラジャブ月の始まり（聖なる月）", en: "Start of Rajab (sacred month)", id: "Awal Rajab (bulan haram)" } },
  { id: "isra-miraj", month: 7, day: 27, kind: "other", title: { ja: "イスラーとミウラージュ", en: "Isra and Mi'raj", id: "Isra Mikraj" } },
  { id: "nisfu-syaban", month: 8, day: 15, kind: "other", title: { ja: "シャアバーン月の半ば", en: "Mid-Sha'ban", id: "Nisfu Sya'ban" } },
  { id: "ramadan-1", month: 9, day: 1, kind: "ramadan", title: { ja: "ラマダーン初日", en: "First day of Ramadan", id: "Awal Ramadan" } },
  { id: "nuzul-quran", month: 9, day: 17, kind: "ramadan", title: { ja: "クルアーン啓示の日", en: "Nuzul al-Quran", id: "Nuzulul Qur'an" } },
  { id: "lailatul-qadr", month: 9, day: 27, kind: "ramadan", title: { ja: "ライラトゥル・カドル（最後の10夜）", en: "Laylat al-Qadr (last ten nights)", id: "Lailatul Qadar (10 malam terakhir)" } },
  { id: "eid-fitr", month: 10, day: 1, kind: "eid", title: { ja: "イード・アル＝フィトル", en: "Eid al-Fitr", id: "Idulfitri" } },
  { id: "syawal-fast", month: 10, day: 2, kind: "fast", title: { ja: "シャウワール月の6日間の断食", en: "Six days of Shawwal", id: "Puasa 6 hari Syawal" } },
  { id: "dzulhijjah-1", month: 12, day: 1, kind: "hajj", title: { ja: "ズー・アル＝ヒッジャ月の最初の10日間", en: "First ten days of Dhu al-Hijjah", id: "Sepuluh hari pertama Zulhijah" } },
  { id: "tarwiyah", month: 12, day: 8, kind: "hajj", title: { ja: "タルウィヤの日", en: "Day of Tarwiyah", id: "Hari Tarwiyah" } },
  { id: "arafah", month: 12, day: 9, kind: "fast", title: { ja: "アラファの日の断食", en: "Day of Arafah", id: "Puasa Arafah" } },
  { id: "eid-adha", month: 12, day: 10, kind: "eid", title: { ja: "イード・アル＝アドハー", en: "Eid al-Adha", id: "Iduladha" } },
  { id: "tasyrik", month: 12, day: 11, kind: "hajj", title: { ja: "タシュリークの日々（11〜13日）", en: "Days of Tashriq (11 to 13)", id: "Hari Tasyrik (11-13)" } },
];
