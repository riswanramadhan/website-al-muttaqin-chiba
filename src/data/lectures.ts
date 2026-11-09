import type { FeaturedVideo, Lecture, LocalizedText } from "@/lib/types";

/**
 * Rekaman kajian (YouTube) dari kanal Raymond Chin (https://www.youtube.com/@RaymondChins),
 * hanya video yang membahas Islam. Semua ID diverifikasi lewat oEmbed YouTube (author: Raymond Chin);
 * judul `id` = judul asli video, `ja`/`en` terjemahan. Tanggal = tanggal tayang di YouTube (UTC),
 * durasi dibulatkan ke menit.
 */
const SPEAKER = "Raymond Chin";

const ESCAPE_2025: LocalizedText = {
  ja: "ESCAPE ラマダン特別番組 2025",
  en: "ESCAPE Ramadan series 2025",
  id: "ESCAPE Ramadan 2025",
};

const ESCAPE_2026: LocalizedText = {
  ja: "ESCAPE ラマダン特別番組 2026",
  en: "ESCAPE Ramadan series 2026",
  id: "ESCAPE Ramadan 2026",
};

const PODCAST: LocalizedText = {
  ja: "レイモンド・チン ポッドキャスト",
  en: "Raymond Chin podcast",
  id: "Podcast Raymond Chin",
};

export const lectures: Lecture[] = [
  {
    id: "lec-rc-001",
    slug: "konsep-tuhan-yang-99-persen-orang-salah",
    title: {
      ja: "99%の人が誤解している「神」の概念（ESCAPE 第12話）",
      en: "The concept of God that 99% of people get wrong (ESCAPE ep. 12)",
      id: "KONSEP TUHAN YANG 99% ORANG SALAH - Escape Eps 12 (Ft Felix Siauw, Koiyo Cabe, Verren, Fuadh)",
    },
    speaker: SPEAKER,
    youtubeId: "dFW3YIWWvcI",
    publishedAt: "2026-03-02T09:00:06.000Z",
    durationMinutes: 81,
    series: ESCAPE_2026,
    description: {
      ja: "お金、恋愛、権力など、人が何かに執着して「しもべ」になってしまう理由と、その執着を手放す方法を考えます。ゲストにフェリックス・シアウ師。",
      en: "Why people so easily become \"servants\" of money, love, or power, and how to let go of that attachment. With guest Ustadz Felix Siauw.",
      id: "Mengapa manusia mudah menjadi \"hamba\" dari uang, cinta, atau kekuasaan, dan bagaimana melepaskan keterikatan itu. Bersama Ustadz Felix Siauw.",
    },
    language: "id",
    tags: ["akidah", "tauhid", "ramadan"],
  },
  {
    id: "lec-rc-002",
    slug: "riba-paylater-dan-investasi",
    title: {
      ja: "リバー（利息）、後払い、投資は許されるのか（ESCAPE 第11話）",
      en: "Riba, paylater, and investing: when are they allowed? (ESCAPE ep. 11)",
      id: "RIBA, PAYLATER DAN INVESTASI ITU BOLEH, KALAU...... - Escape Eps 11 (ft Felix Siauw, Koiyo, Verren)",
    },
    speaker: SPEAKER,
    youtubeId: "II5BHIN8tJ0",
    publishedAt: "2026-03-01T09:00:07.000Z",
    durationMinutes: 86,
    series: ESCAPE_2026,
    description: {
      ja: "暗号資産、金、債券、株式はイスラームの視点で投資か賭けか。リバーの境界と、イスラームにかなった投資の考え方を学びます。",
      en: "Crypto, gold, bonds, and shares: investment or gambling from an Islamic point of view? Where riba begins, and a sensible approach to investing in Islam.",
      id: "Kripto, emas, obligasi, dan saham: investasi atau judi menurut Islam? Di mana batas riba dan bagaimana berinvestasi secara masuk akal dalam Islam.",
    },
    language: "id",
    tags: ["muamalah", "riba", "ekonomi-syariah"],
  },
  {
    id: "lec-rc-003",
    slug: "islam-itu-ribet-banyak-aturan",
    title: {
      ja: "イスラームは面倒で規則だらけ？（ESCAPE 第5話）",
      en: "Is Islam complicated, with too many rules? (ESCAPE ep. 5)",
      id: "ISLAM ITU RIBET, BANYAK ATURAN!?!? - Escape Eps 5 (ft Felix Siauw, Koiyo Cabe, Verren)",
    },
    speaker: SPEAKER,
    youtubeId: "p-2feskqE3w",
    publishedAt: "2026-02-23T09:00:07.000Z",
    durationMinutes: 98,
    series: ESCAPE_2026,
    description: {
      ja: "イスラーム法は思われているほど硬直的ではなく、多くの規定には文脈と理由がある。その仕組みを対話形式で掘り下げます。",
      en: "Islamic law is less rigid than many imagine: most rulings have a context and a reason. A conversation on how the rules work.",
      id: "Hukum Islam tidak sekaku yang sering dibayangkan: banyak aturan punya konteks dan alasan. Diskusi tentang cara kerja aturan-aturan itu.",
    },
    language: "id",
    tags: ["fikih", "syariah", "ramadan"],
  },
  {
    id: "lec-rc-004",
    slug: "kiamat-sudah-dekat-ini-tandanya",
    title: {
      ja: "終末は近い？その兆候とは（ESCAPE 第1話）",
      en: "Is the Last Day near? These are the signs (ESCAPE ep. 1)",
      id: "KIAMAT SUDAH DEKAT, INI TANDANYA!? - Escape Eps 1 (ft. Felix Siauw, Koiyocabe, Veren)",
    },
    speaker: SPEAKER,
    youtubeId: "jEQHYSdzEdg",
    publishedAt: "2026-02-19T09:00:06.000Z",
    durationMinutes: 121,
    series: ESCAPE_2026,
    description: {
      ja: "終末（キヤーマ）の基本概念から、なぜ終末が必要なのかという問いまで。シリーズ最長回でダッジャールについても語ります。",
      en: "From the basic concept of the Day of Judgement to why it must come at all. The longest episode of the series, also touching on the Dajjal.",
      id: "Dari konsep dasar hari kiamat sampai pertanyaan mengapa kiamat harus ada. Episode terpanjang di seri ini, termasuk pembahasan tentang Dajjal.",
    },
    language: "id",
    tags: ["akidah", "hari-akhir", "ramadan"],
  },
  {
    id: "lec-rc-005",
    slug: "sejarah-jin-dan-manusia-sampai-lailatul-qodar",
    title: {
      ja: "ジンと人類の歴史からライラトゥル・カドルまで（ESCAPE 第24話）",
      en: "From the story of jinn and humankind to Laylatul Qadr (ESCAPE ep. 24)",
      id: "SEJARAH JIN DAN MANUSIA SAMPAI LAILATUL QODAR - Escape Eps 24 (ft Felix Siauw, Veren)",
    },
    speaker: SPEAKER,
    youtubeId: "ik82ZtQG5Ls",
    publishedAt: "2025-03-24T09:00:06.000Z",
    durationMinutes: 54,
    series: ESCAPE_2025,
    description: {
      ja: "天使、ジン、そしてライラトゥル・カドル（定めの夜）の神秘について、率直な質問に答えるラマダン特別回。",
      en: "A Ramadan episode answering candid questions about angels, jinn, and the mystery of Laylatul Qadr.",
      id: "Episode Ramadan yang menjawab pertanyaan jujur tentang malaikat, jin, dan misteri Lailatul Qadar.",
    },
    language: "id",
    tags: ["akidah", "lailatul-qadar", "ramadan"],
  },
  {
    id: "lec-rc-006",
    slug: "hamba-cuan-vs-hamba-allah",
    title: {
      ja: "お金のしもべか、アッラーのしもべか（ESCAPE 第18話）",
      en: "Servant of money or servant of Allah? (ESCAPE ep. 18)",
      id: "HAMBA CUAN VS HAMBA ALLAH - Escape Eps 18 (ft Felix Siauw, Veren Ornela)",
    },
    speaker: SPEAKER,
    youtubeId: "3VrFq5z_SU0",
    publishedAt: "2025-03-18T09:00:07.000Z",
    durationMinutes: 64,
    series: ESCAPE_2025,
    description: {
      ja: "お金は人生の目的ではなく道具であるべき。物質主義に目をくらまされないための心構えを語ります。",
      en: "Money should be a tool in life, not its goal. On not being blinded by wealth and materialism.",
      id: "Uang seharusnya menjadi alat dalam hidup, bukan tujuan. Tentang menjaga diri agar tidak dibutakan oleh harta dan hedonisme.",
    },
    language: "id",
    tags: ["tazkiyah", "harta", "ramadan"],
  },
  {
    id: "lec-rc-007",
    slug: "bongkar-mitos-takdir-di-islam",
    title: {
      ja: "イスラームにおける「定め（タクディール）」の誤解を解く（ESCAPE 第14話）",
      en: "Unpacking myths about destiny (taqdir) in Islam (ESCAPE ep. 14)",
      id: "BONGKAR MITOS \"TAKDIR\" DI ISLAM! - Escape Eps 14  (Ft Felix Siauw)",
    },
    speaker: SPEAKER,
    youtubeId: "gXNrXJjdEs4",
    publishedAt: "2025-03-14T09:00:07.000Z",
    durationMinutes: 54,
    series: ESCAPE_2025,
    description: {
      ja: "怠けを「定め」のせいにしないために。イスラームにおけるタクディール（定命）の概念を理解します。",
      en: "Understanding the concept of taqdir in Islam, so that destiny is not used as an excuse for giving up.",
      id: "Memahami konsep takdir dalam Islam agar tidak dijadikan alasan untuk pasrah dan bermalas-malasan.",
    },
    language: "id",
    tags: ["akidah", "takdir", "ramadan"],
  },
  {
    id: "lec-rc-008",
    slug: "ajaran-islam-dan-para-nabi-untuk-naik-level",
    title: {
      ja: "成長のためのイスラームの教えと預言者たち（ESCAPE 第1話）",
      en: "Islamic teachings and the prophets for leveling up (ESCAPE ep. 1)",
      id: "KABUR!! AJARAN ISLAM DAN PARA NABI UNTUK NAIK LEVEL - Escape Ep 1 (ft Felix Siauw)",
    },
    speaker: SPEAKER,
    youtubeId: "KYszstjudqU",
    publishedAt: "2025-03-01T09:00:06.000Z",
    durationMinutes: 39,
    series: ESCAPE_2025,
    description: {
      ja: "ラマダン特別番組 ESCAPE の第1話。イフタールのひとときに、イスラームの教えと預言者たちの姿から学びます。",
      en: "The first episode of the ESCAPE Ramadan programme: learning from Islamic teachings and the prophets, to keep you company at iftar.",
      id: "Episode pertama program Ramadan ESCAPE: belajar dari ajaran Islam dan para nabi, menemani waktu berbuka puasa.",
    },
    language: "id",
    tags: ["sirah", "para-nabi", "ramadan"],
  },
  {
    id: "lec-rc-009",
    slug: "agama-itu-penting",
    title: {
      ja: "宗教は大切である",
      en: "Religion matters",
      id: "AGAMA ITU PENTING.",
    },
    speaker: SPEAKER,
    youtubeId: "U5b9fO_V0No",
    publishedAt: "2024-12-12T11:01:40.000Z",
    durationMinutes: 9,
    description: {
      ja: "かつて宗教を信じていなかった語り手が、個人と文明の両面から、なぜ宗教が大切なのかを語る短い動画。",
      en: "A short talk from someone who once did not believe in religion, on why religion matters for the individual and for civilization.",
      id: "Video singkat dari seseorang yang dulu tidak percaya agama, tentang mengapa agama penting bagi individu maupun peradaban.",
    },
    language: "id",
    tags: ["iman", "agama"],
  },
  {
    id: "lec-rc-010",
    slug: "belajar-islam-pake-logika",
    title: {
      ja: "論理で学ぶイスラーム（ゲスト：フェリックス・シアウ師）",
      en: "Learning Islam through logic (ft. Felix Siauw)",
      id: "Belajar Islam Pake Logika ft Felix Siauw",
    },
    speaker: SPEAKER,
    youtubeId: "J97G-nzTJRw",
    publishedAt: "2024-11-25T10:59:10.000Z",
    durationMinutes: 88,
    series: PODCAST,
    description: {
      ja: "宗教を学ぶこと、論理と感情、宗教をめぐる対立はなぜ起きるのかなどを、フェリックス・シアウ師と語り合うポッドキャスト。",
      en: "A podcast with Ustadz Felix Siauw on learning religion, logic versus feelings, and why conflicts over religion arise.",
      id: "Podcast bersama Ustadz Felix Siauw tentang belajar agama Islam, logika versus perasaan, dan mengapa konflik agama bisa terjadi.",
    },
    language: "id",
    tags: ["pengantar", "iman", "logika"],
  },
];

/** Video dokumenter Al Muttaqin (diverifikasi lewat oEmbed YouTube). */
export const documentary: FeaturedVideo = {
  youtubeId: "NoQclilJUqo",
  title: "Video Dokumenter Masjid Al-Muttaqin Chiba — Mualaf & Islamic Cultural Center",
  channelName: "almuttaqin. project",
  channelUrl: "https://www.youtube.com/@almuttaqin_chiba",
  publishedAt: "2026-06-29T10:21:12.000Z",
  durationSeconds: 454,
};
