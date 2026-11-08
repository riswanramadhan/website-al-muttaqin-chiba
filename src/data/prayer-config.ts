import type { PrayerConfig, JumuahSchedule } from "@/lib/types";

/**
 * Konfigurasi waktu salat. Metode hitung dan jam iqamah disepakati bersama pengurus
 * (PRD §9.2); admin dapat mengubah koreksi menit per salat.
 */
export const prayerConfig: PrayerConfig = {
  method: "MuslimWorldLeague",
  madhab: "shafi",
  highLatitudeRule: "MiddleOfTheNight",
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 2, asr: 0, maghrib: 2, isha: 0 },
  iqamah: {
    fajr: { type: "offset", minutes: 20 },
    dhuhr: { type: "offset", minutes: 10 },
    asr: { type: "offset", minutes: 10 },
    maghrib: { type: "offset", minutes: 5 },
    isha: { type: "offset", minutes: 10 },
  },
  hijriAdjustment: 0,
  timezone: "Asia/Tokyo",
  jumuah: {
    time: "12:30",
    note: {
      ja: "金曜礼拝は12:30開始（説教は12:30、礼拝は12:50頃）。早めにお越しください。",
      en: "Jumuah starts at 12:30 (khutbah 12:30, prayer around 12:50). Please arrive early.",
      id: "Salat Jumat dimulai 12:30 (khutbah 12:30, salat sekitar 12:50). Mohon datang lebih awal.",
    },
  },
  // Ramadan 1448 H diperkirakan 8 Feb - 9 Mar 2027 (menunggu konfirmasi rukyat).
  ramadan: { start: "2027-02-08", end: "2027-03-09" },
};

/** Jadwal Jumat: diisi admin per pekan. Tanggal adalah hari Jumat (Asia/Tokyo). */
export const jumuahSchedules: JumuahSchedule[] = [
  {
    id: "j-2026-10-30",
    date: "2026-10-30",
    khatib: "Ust. Ahmad Fauzi",
    imam: "Ust. Ahmad Fauzi",
    time: "12:30",
    language: "id",
    topic: { ja: "感謝の心", en: "The heart of gratitude", id: "Hati yang bersyukur" },
  },
  {
    id: "j-2026-11-06",
    date: "2026-11-06",
    khatib: "Sensei Kyoichiro Sugimoto",
    imam: "Ust. Ahmad Fauzi",
    time: "12:30",
    language: "ja",
    topic: { ja: "隣人への善行", en: "Kindness to neighbours", id: "Berbuat baik kepada tetangga" },
  },
  {
    id: "j-2026-11-13",
    date: "2026-11-13",
    khatib: "Ust. Abdullah Rahman",
    imam: "Ust. Abdullah Rahman",
    time: "12:30",
    language: "en",
    topic: { ja: "礼拝を大切にする", en: "Guarding the prayer", id: "Menjaga salat" },
  },
  {
    id: "j-2026-11-20",
    date: "2026-11-20",
    khatib: "Ust. Ahmad Fauzi",
    imam: "Ust. Ahmad Fauzi",
    time: "12:30",
    language: "id",
    topic: { ja: "子どもの教育", en: "Raising our children", id: "Mendidik anak" },
  },
  {
    id: "j-2026-11-27",
    date: "2026-11-27",
    khatib: "Sensei Kyoichiro Sugimoto",
    imam: "Ust. Abdullah Rahman",
    time: "12:30",
    language: "ja",
    topic: { ja: "日本社会で生きるムスリム", en: "Living as a Muslim in Japan", id: "Menjadi muslim di Jepang" },
  },
  {
    id: "j-2026-12-04",
    date: "2026-12-04",
    khatib: "Ust. Abdullah Rahman",
    imam: "Ust. Ahmad Fauzi",
    time: "12:30",
    language: "en",
    topic: { ja: "誠実さ（イフサーン）", en: "Ihsan: excellence in faith", id: "Ihsan: kesempurnaan iman" },
  },
];
