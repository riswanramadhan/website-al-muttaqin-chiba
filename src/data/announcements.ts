import type { Announcement } from "@/lib/types";

/** Pengumuman resmi. Dikelola admin; seed ini contoh awal. */
export const announcements: Announcement[] = [
  {
    id: "ann-001",
    slug: "jadwal-kajian-pekanan-november-2026",
    title: {
      ja: "11月の毎週の勉強会スケジュール",
      en: "Weekly study circle schedule for November",
      id: "Jadwal kajian pekanan bulan November",
    },
    excerpt: {
      ja: "毎週土曜日のマグリブ後、インドネシア語・日本語・英語の勉強会を交互に開催します。",
      en: "Every Saturday after Maghrib, study circles rotate between Indonesian, Japanese, and English.",
      id: "Setiap Sabtu ba'da Maghrib, kajian bergantian dalam bahasa Indonesia, Jepang, dan Inggris.",
    },
    body: {
      ja: [
        { type: "p", text: "11月の毎週の勉強会は、毎週土曜日のマグリブ礼拝後に開催します。" },
        { type: "ul", items: ["第1・3土曜日：インドネシア語", "第2土曜日：日本語（改宗者・入門者向け）", "第4土曜日：英語"] },
        { type: "callout", tone: "info", text: "お子様連れも歓迎です。託児スペースをご利用ください。" },
      ],
      en: [
        { type: "p", text: "Weekly study circles in November are held every Saturday after Maghrib prayer." },
        { type: "ul", items: ["1st and 3rd Saturday: Indonesian", "2nd Saturday: Japanese (for new Muslims and beginners)", "4th Saturday: English"] },
        { type: "callout", tone: "info", text: "Families with children are welcome; a kids corner is available." },
      ],
      id: [
        { type: "p", text: "Kajian pekanan bulan November diadakan setiap Sabtu setelah salat Maghrib." },
        { type: "ul", items: ["Sabtu ke-1 dan ke-3: bahasa Indonesia", "Sabtu ke-2: bahasa Jepang (untuk muallaf dan pemula)", "Sabtu ke-4: bahasa Inggris"] },
        { type: "callout", tone: "info", text: "Keluarga dengan anak dipersilakan; tersedia area anak." },
      ],
    },
    category: "event",
    publishedAt: "2026-10-28T03:00:00.000Z",
    pinned: true,
  },
  {
    id: "ann-002",
    slug: "infaq-operasional-musim-dingin",
    title: {
      ja: "冬の運営インファーク（暖房費）へのご協力のお願い",
      en: "Winter operational infaq: heating costs",
      id: "Infaq operasional musim dingin: biaya pemanas",
    },
    excerpt: {
      ja: "12月から3月の暖房費と光熱費のため、毎月のインファークにご協力ください。",
      en: "Please support monthly infaq for heating and utilities from December to March.",
      id: "Mohon dukungan infaq bulanan untuk pemanas dan listrik dari Desember sampai Maret.",
    },
    body: {
      ja: [
        { type: "p", text: "冬季の暖房費と光熱費は月およそ8万円かかります。インファークはゆうちょ銀行口座またはQRISで受け付けています。" },
        { type: "p", text: "送金後は寄付ページの確認フォームからお知らせください。" },
      ],
      en: [
        { type: "p", text: "Heating and utilities cost around JPY 80,000 per month in winter. Infaq is accepted via Japan Post Bank or QRIS." },
        { type: "p", text: "After transferring, please let us know through the confirmation form on the donation page." },
      ],
      id: [
        { type: "p", text: "Biaya pemanas dan listrik di musim dingin sekitar ¥80.000 per bulan. Infaq diterima lewat Japan Post Bank atau QRIS." },
        { type: "p", text: "Setelah transfer, mohon konfirmasi melalui formulir di halaman infaq." },
      ],
    },
    category: "donation",
    publishedAt: "2026-10-25T03:00:00.000Z",
    pinned: false,
  },
  {
    id: "ann-003",
    slug: "pendaftaran-tpa-semester-baru",
    title: {
      ja: "子どもクルアーン教室（TPA）新学期の募集",
      en: "Children's Quran class (TPA) enrollment for the new term",
      id: "Pendaftaran TPA semester baru",
    },
    excerpt: {
      ja: "4歳から12歳のお子様を対象に、毎週日曜日の午前中に開講します。",
      en: "For children aged 4 to 12, every Sunday morning.",
      id: "Untuk anak usia 4-12 tahun, setiap Minggu pagi.",
    },
    body: {
      ja: [
        { type: "p", text: "新学期は12月第1日曜日から始まります。定員は30名、先着順です。" },
        { type: "p", text: "お申し込みはプログラムページの登録フォームからお願いします。" },
      ],
      en: [
        { type: "p", text: "The new term starts on the first Sunday of December. Capacity is 30 children, first come first served." },
        { type: "p", text: "Register through the form on the programs page." },
      ],
      id: [
        { type: "p", text: "Semester baru dimulai Minggu pertama Desember. Kuota 30 anak, siapa cepat dia dapat." },
        { type: "p", text: "Daftar lewat formulir di halaman program." },
      ],
    },
    category: "general",
    publishedAt: "2026-10-20T03:00:00.000Z",
    pinned: false,
  },
  {
    id: "ann-004",
    slug: "jadwal-iqamah-musim-dingin",
    title: {
      ja: "冬のイカーマ時刻の変更（11月8日から）",
      en: "Winter iqamah times from 8 November",
      id: "Perubahan jadwal iqamah musim dingin mulai 8 November",
    },
    excerpt: {
      ja: "日没が早まるため、マグリブとイシャーの集団礼拝の時刻を冬時間に切り替えます。",
      en: "As sunset comes earlier, Maghrib and Isha congregation times switch to the winter schedule.",
      id: "Karena matahari terbenam lebih cepat, jamaah Maghrib dan Isya beralih ke jadwal musim dingin.",
    },
    body: {
      ja: [
        { type: "p", text: "11月8日（日）から、マグリブはアザーンの5分後、イシャーは19:30固定で集団礼拝を行います。" },
        { type: "ul", items: ["ファジュル：アザーンの20分後", "ズフル：12:30固定（金曜は12:30と13:15の2回）", "アスル：アザーンの10分後", "マグリブ：アザーンの5分後", "イシャー：19:30固定"] },
        { type: "callout", tone: "info", text: "最新の時刻はアプリの礼拝時間画面でいつでも確認できます。" },
      ],
      en: [
        { type: "p", text: "From Sunday 8 November, Maghrib is held 5 minutes after the adhan and Isha at a fixed 19:30." },
        { type: "ul", items: ["Fajr: 20 minutes after the adhan", "Dhuhr: fixed 12:30 (Fridays at 12:30 and 13:15)", "Asr: 10 minutes after the adhan", "Maghrib: 5 minutes after the adhan", "Isha: fixed 19:30"] },
        { type: "callout", tone: "info", text: "The latest times are always on the prayer screen of the app." },
      ],
      id: [
        { type: "p", text: "Mulai Minggu 8 November, Maghrib berjamaah 5 menit setelah azan dan Isya tetap pukul 19:30." },
        { type: "ul", items: ["Subuh: 20 menit setelah azan", "Zuhur: tetap 12:30 (Jumat pukul 12:30 dan 13:15)", "Asar: 10 menit setelah azan", "Maghrib: 5 menit setelah azan", "Isya: tetap 19:30"] },
        { type: "callout", tone: "info", text: "Jadwal terbaru selalu tersedia di layar waktu salat aplikasi." },
      ],
    },
    category: "prayer",
    publishedAt: "2026-11-01T03:00:00.000Z",
    pinned: true,
  },
  {
    id: "ann-005",
    slug: "parkir-terbatas-saat-salat-jumat",
    title: {
      ja: "金曜礼拝時の駐車場のご案内",
      en: "Parking during Jumuah prayer",
      id: "Parkir saat salat Jumat",
    },
    excerpt: {
      ja: "敷地内の駐車場は8台分のみです。公共交通機関と近隣のコインパーキングのご利用をお願いします。",
      en: "The on-site car park has only eight spaces. Please use public transport or nearby paid parking.",
      id: "Parkir di lahan masjid hanya 8 mobil. Mohon gunakan transportasi umum atau parkir berbayar terdekat.",
    },
    body: {
      ja: [
        { type: "p", text: "近隣の皆様とのよい関係を保つため、路上駐車は絶対にしないでください。敷地内の駐車場は高齢者と体の不自由な方を優先します。" },
        { type: "p", text: "徒歩5分以内に3か所のコインパーキングがあります。アクセスページの地図をご確認ください。" },
      ],
      en: [
        { type: "p", text: "To keep good relations with our neighbours, please never park on the street. On-site spaces are reserved for the elderly and those with limited mobility." },
        { type: "p", text: "There are three paid car parks within a five-minute walk; see the map on the access page." },
      ],
      id: [
        { type: "p", text: "Demi hubungan baik dengan tetangga, jangan pernah parkir di jalan. Lahan parkir masjid diprioritaskan untuk lansia dan yang berkebutuhan khusus." },
        { type: "p", text: "Ada tiga parkir berbayar dalam jarak jalan kaki lima menit; lihat peta di halaman akses." },
      ],
    },
    category: "general",
    publishedAt: "2026-11-05T03:00:00.000Z",
    pinned: false,
  },
  {
    id: "ann-006",
    slug: "sekretariat-tutup-akhir-tahun",
    title: {
      ja: "年末年始の事務局休業のお知らせ",
      en: "Office closure over the New Year holidays",
      id: "Sekretariat tutup selama libur tahun baru",
    },
    excerpt: {
      ja: "12月29日から1月3日まで事務局はお休みです。礼拝は通常どおり行います。",
      en: "The office is closed from 29 December to 3 January. Prayers continue as usual.",
      id: "Sekretariat libur 29 Desember sampai 3 Januari. Salat berjamaah tetap berjalan seperti biasa.",
    },
    body: {
      ja: [
        { type: "p", text: "期間中のお問い合わせはWhatsAppで受け付けますが、返信に時間がかかる場合があります。部屋の予約と証明書の発行は1月4日以降の対応となります。" },
      ],
      en: [
        { type: "p", text: "During this period we still answer WhatsApp messages, but replies may be slower. Room bookings and certificates will be handled from 4 January." },
      ],
      id: [
        { type: "p", text: "Selama periode ini pesan WhatsApp tetap dibalas, tetapi mungkin lebih lambat. Peminjaman ruangan dan surat keterangan dilayani mulai 4 Januari." },
      ],
    },
    category: "general",
    publishedAt: "2026-11-06T03:00:00.000Z",
    pinned: false,
    expiresAt: "2027-01-05T00:00:00.000Z",
  },
  {
    id: "ann-007",
    slug: "peringatan-topan-oktober-2026",
    title: {
      ja: "台風接近に伴う10月10日の活動中止",
      en: "Activities cancelled on 10 October due to the typhoon",
      id: "Kegiatan 10 Oktober dibatalkan karena topan",
    },
    excerpt: {
      ja: "台風の接近に伴い、10月10日の勉強会とTPAは中止します。安全を最優先してください。",
      en: "Due to the approaching typhoon, the study circle and TPA on 10 October are cancelled. Please stay safe.",
      id: "Karena topan mendekat, kajian dan TPA pada 10 Oktober dibatalkan. Utamakan keselamatan.",
    },
    body: {
      ja: [{ type: "p", text: "集団礼拝は行いますが、無理に来館しないでください。最新情報はWhatsAppグループでお知らせします。" }],
      en: [{ type: "p", text: "Congregational prayers continue, but please do not travel if it is unsafe. Updates will be posted in the WhatsApp group." }],
      id: [{ type: "p", text: "Salat berjamaah tetap ada, tetapi jangan memaksakan datang bila tidak aman. Informasi terbaru lewat grup WhatsApp." }],
    },
    category: "urgent",
    publishedAt: "2026-10-09T06:00:00.000Z",
    pinned: false,
    expiresAt: "2026-10-12T00:00:00.000Z",
  },
];
