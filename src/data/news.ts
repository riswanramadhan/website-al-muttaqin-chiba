import type { NewsPost } from "@/lib/types";

/** Berita, laporan kegiatan, artikel, dan liputan media. */
export const news: NewsPost[] = [
  {
    id: "news-001",
    slug: "laporan-open-mosque-oktober-2026",
    title: {
      ja: "10月オープンモスクデーの報告：近隣から48名が来館",
      en: "October Open Mosque Day report: 48 neighbours visited",
      id: "Laporan Open Mosque Day Oktober: 48 tetangga berkunjung",
    },
    excerpt: {
      ja: "松戸市内の学校と自治会からの参加者が礼拝を見学し、ハラール料理を体験しました。",
      en: "Visitors from local schools and the neighbourhood association watched the prayer and tried halal food.",
      id: "Peserta dari sekolah dan asosiasi warga Matsudo menyaksikan salat dan mencicipi makanan halal.",
    },
    body: {
      ja: [
        { type: "p", text: "10月18日に開催したオープンモスクデーには48名が来館しました。参加者の多くはイスラームについて初めて学ぶ方々でした。" },
        { type: "p", text: "14:00のアスル礼拝を見学した後、インドネシア料理のハラール軽食を囲んで質疑応答を行いました。" },
        { type: "quote", text: "モスクがこんなに開かれた場所だとは知りませんでした。", cite: "参加者（松戸市在住）" },
      ],
      en: [
        { type: "p", text: "Forty-eight people visited the Open Mosque Day on 18 October, most of them learning about Islam for the first time." },
        { type: "p", text: "After watching the Asr prayer at 14:00, guests shared halal Indonesian snacks and asked questions." },
        { type: "quote", text: "I did not know a mosque could be such an open place.", cite: "A visitor from Matsudo" },
      ],
      id: [
        { type: "p", text: "Open Mosque Day pada 18 Oktober dihadiri 48 orang, sebagian besar baru pertama kali mengenal Islam." },
        { type: "p", text: "Setelah menyaksikan salat Asar pukul 14:00, para tamu menikmati camilan halal Indonesia sambil bertanya jawab." },
        { type: "quote", text: "Saya tidak tahu masjid bisa seterbuka ini.", cite: "Seorang pengunjung dari Matsudo" },
      ],
    },
    category: "report",
    publishedAt: "2026-10-21T03:00:00.000Z",
    author: "Tim Media Al Muttaqin",
    tags: ["open-mosque", "komunitas"],
  },
  {
    id: "news-002",
    slug: "masjid-al-muttaqin-resmi-dibuka",
    title: {
      ja: "マスジド・アルムッタキーン、松戸に開所",
      en: "Masjid Al-Muttaqin opens in Matsudo",
      id: "Masjid Al-Muttaqin resmi dibuka di Matsudo",
    },
    excerpt: {
      ja: "千葉イスラム文化センターとドンペット・ドゥアファ・ジャパンの協力で建てられたモスクが、礼拝と学びの場として開所しました。",
      en: "Built through the partnership of Chiba Islamic Culture Center and Dompet Dhuafa Japan, the mosque opens as a place of worship and learning.",
      id: "Dibangun lewat kolaborasi Chiba Islamic Culture Center dan Dompet Dhuafa Japan, masjid dibuka sebagai tempat ibadah dan belajar.",
    },
    body: {
      ja: [
        { type: "p", text: "建設募金にご協力くださった皆様、ありがとうございました。これからは運営インファークと学びのプログラムに力を注ぎます。" },
        { type: "h2", text: "これからの活動" },
        { type: "ul", items: ["毎日の集団礼拝と金曜礼拝", "毎週の勉強会（3言語）", "ムアッラフ講座と子どもクルアーン教室", "地域向けオープンモスクと日本語クラス"] },
      ],
      en: [
        { type: "p", text: "Thank you to everyone who supported the construction campaign. From now on, our focus is operational infaq and learning programs." },
        { type: "h2", text: "What comes next" },
        { type: "ul", items: ["Daily congregational prayers and Jumuah", "Weekly study circles in three languages", "New Muslim course and children's Quran class", "Open mosque days and Japanese classes for the community"] },
      ],
      id: [
        { type: "p", text: "Terima kasih kepada semua yang mendukung wakaf pembangunan. Mulai sekarang fokus kami adalah infaq operasional dan program pembinaan." },
        { type: "h2", text: "Langkah berikutnya" },
        { type: "ul", items: ["Salat berjamaah harian dan Jumat", "Kajian pekanan tiga bahasa", "Kelas muallaf dan TPA", "Open mosque dan kelas bahasa Jepang untuk warga"] },
      ],
    },
    category: "news",
    publishedAt: "2026-10-01T03:00:00.000Z",
    author: "Pengurus Al Muttaqin Cultural Center",
    tags: ["pembukaan", "sejarah"],
  },
  {
    id: "news-003",
    slug: "liputan-koho-matsudo-masjid-baru",
    title: {
      ja: "市の広報誌にモスクが紹介されました",
      en: "The mosque featured in the city newsletter",
      id: "Masjid diliput buletin resmi Kota Matsudo",
    },
    excerpt: {
      ja: "松戸市の広報誌10月号「多文化共生のまち」特集で、当センターの活動が取り上げられました。",
      en: "The October issue of the Matsudo city newsletter featured the center in its multicultural living special.",
      id: "Edisi Oktober buletin Kota Matsudo mengangkat kegiatan pusat kami dalam rubrik hidup multikultural.",
    },
    body: {
      ja: [
        { type: "p", text: "特集では、ムアッラフ講座、日本語クラス、オープンモスクデーの取り組みが紹介され、「地域に開かれた宗教施設」として評価をいただきました。" },
        { type: "p", text: "取材にご協力くださったジャマーアの皆様、ありがとうございました。広報誌は市役所と各支所で配布されています。" },
      ],
      en: [
        { type: "p", text: "The feature introduced the New Muslim course, the Japanese class, and Open Mosque Day, describing the center as a religious facility open to its neighbourhood." },
        { type: "p", text: "Thank you to the congregation members who took part in the interview. The newsletter is available at city hall and branch offices." },
      ],
      id: [
        { type: "p", text: "Liputan itu memperkenalkan kelas muallaf, kelas bahasa Jepang, dan Open Mosque Day, serta menyebut pusat kami sebagai fasilitas keagamaan yang terbuka bagi lingkungannya." },
        { type: "p", text: "Terima kasih kepada jamaah yang bersedia diwawancarai. Buletin tersedia di balai kota dan kantor cabang." },
      ],
    },
    category: "press",
    publishedAt: "2026-10-12T03:00:00.000Z",
    author: "Tim Media Al Muttaqin",
    tags: ["media", "komunitas"],
  },
  {
    id: "news-004",
    slug: "kerja-sama-kunjungan-mahasiswa-universitas",
    title: {
      ja: "大学の国際学部と見学プログラムで連携",
      en: "Partnership with a university faculty for student visits",
      id: "Kerja sama kunjungan mahasiswa dengan fakultas internasional universitas",
    },
    excerpt: {
      ja: "県内の大学の国際学部と、学生向けのモスク見学と対話プログラムを年2回行うことで合意しました。",
      en: "We agreed with a university faculty in the prefecture to host mosque visits and dialogue sessions for students twice a year.",
      id: "Disepakati dengan fakultas internasional sebuah universitas di Chiba untuk kunjungan dan dialog mahasiswa dua kali setahun.",
    },
    body: {
      ja: [
        { type: "p", text: "第1回は11月下旬を予定しています。学生は礼拝の見学、ムスリム学生との対話、ハラール食の体験を通じて、イスラームと多文化共生について学びます。" },
        { type: "callout", tone: "info", text: "対話セッションに参加してくださるジャマーア（日本語または英語）を募集しています。お問い合わせページからご連絡ください。" },
      ],
      en: [
        { type: "p", text: "The first visit is planned for late November. Students will watch the prayer, talk with Muslim students, and try halal food as part of their intercultural studies." },
        { type: "callout", tone: "info", text: "We are looking for congregation members (Japanese or English) to join the dialogue sessions. Please reach us through the contact page." },
      ],
      id: [
        { type: "p", text: "Kunjungan pertama direncanakan akhir November. Mahasiswa akan menyaksikan salat, berdialog dengan mahasiswa muslim, dan mencoba makanan halal sebagai bagian studi lintas budaya." },
        { type: "callout", tone: "info", text: "Kami mencari jamaah (berbahasa Jepang atau Inggris) untuk ikut sesi dialog. Silakan hubungi lewat halaman kontak." },
      ],
    },
    category: "news",
    publishedAt: "2026-10-27T03:00:00.000Z",
    author: "Pengurus Al Muttaqin Cultural Center",
    tags: ["kunjungan", "pendidikan"],
  },
  {
    id: "news-005",
    slug: "laporan-kajian-pekanan-oktober-2026",
    title: {
      ja: "10月の勉強会報告：4回開催、延べ210名が参加",
      en: "October study circle report: four sessions, 210 attendances",
      id: "Laporan kajian pekanan Oktober: 4 sesi, 210 kehadiran",
    },
    excerpt: {
      ja: "三言語で行った10月の土曜勉強会のまとめと、録画の公開状況です。",
      en: "A summary of October's Saturday circles in three languages and which recordings are online.",
      id: "Ringkasan kajian Sabtu bulan Oktober dalam tiga bahasa dan rekaman yang sudah tayang.",
    },
    body: {
      ja: [
        { type: "p", text: "10月は4回の土曜勉強会を行い、延べ210名が参加しました。アラビア語の特別回（アルバイーン解説）には通訳付きで68名が集まりました。" },
        { type: "ol", items: ["10月3日：ウドゥーの基本（日本語）", "10月10日：日本でムスリムの子どもを育てる（英語）", "10月17日：はじめての礼拝（日本語）", "10月24日：美名を通してアッラーを知る（インドネシア語）", "10月31日：アルバイーン第1ハディース（アラビア語・通訳付き）"] },
        { type: "p", text: "すべての録画は勉強会ページで視聴できます。" },
      ],
      en: [
        { type: "p", text: "Four Saturday circles were held in October with 210 attendances in total. The special Arabic session on the Arba'in drew 68 people with interpretation." },
        { type: "ol", items: ["3 October: basics of wudu (Japanese)", "10 October: raising Muslim children in Japan (English)", "17 October: prayer for beginners (Japanese)", "24 October: knowing Allah through His names (Indonesian)", "31 October: Arba'in hadith 1 (Arabic with interpretation)"] },
        { type: "p", text: "All recordings are available on the lectures page." },
      ],
      id: [
        { type: "p", text: "Sepanjang Oktober diadakan empat kajian Sabtu dengan total 210 kehadiran. Sesi khusus bahasa Arab (syarah Arbain) dihadiri 68 orang dengan penerjemah." },
        { type: "ol", items: ["3 Oktober: dasar wudu (Jepang)", "10 Oktober: mendidik anak muslim di Jepang (Inggris)", "17 Oktober: salat untuk pemula (Jepang)", "24 Oktober: mengenal Allah lewat Asmaul Husna (Indonesia)", "31 Oktober: Arbain hadis pertama (Arab, diterjemahkan)"] },
        { type: "p", text: "Semua rekaman dapat ditonton di halaman kajian." },
      ],
    },
    category: "report",
    publishedAt: "2026-11-02T03:00:00.000Z",
    author: "Tim Media Al Muttaqin",
    tags: ["kajian", "laporan"],
  },
  {
    id: "news-006",
    slug: "menghadapi-musim-dingin-pertama-di-jepang",
    title: {
      ja: "日本で初めての冬を迎えるムスリムへ：礼拝と暮らしのヒント",
      en: "Facing your first winter in Japan: tips for prayer and daily life",
      id: "Menghadapi musim dingin pertama di Jepang: tips ibadah dan keseharian",
    },
    excerpt: {
      ja: "早いマグリブ、冷たい水でのウドゥー、暖房費。冬を安心して過ごすための実用記事。",
      en: "Early Maghrib, wudu with cold water, heating bills: a practical article for a comfortable winter.",
      id: "Maghrib yang cepat, wudu dengan air dingin, biaya pemanas: artikel praktis agar nyaman melewati musim dingin.",
    },
    body: {
      ja: [
        { type: "h2", text: "礼拝時間が大きく変わります" },
        { type: "p", text: "12月のマグリブは16:30ごろ、ファジュルは5:00ごろです。アプリの通知を有効にして、勤務先での礼拝時間をあらかじめ相談しておきましょう。" },
        { type: "h2", text: "冷たい水でのウドゥー" },
        { type: "p", text: "お湯を使ってもウドゥーは有効です。モスクの清め場には温水が出ます。靴下の上を拭く（マスフ）の条件も勉強会で解説しています。" },
        { type: "h2", text: "暖房と光熱費" },
        { type: "p", text: "こたつや電気毛布は電気代が比較的安く、エアコンの設定温度は20度前後が目安です。市の補助制度は市役所の外国人相談窓口で案内しています。" },
      ],
      en: [
        { type: "h2", text: "Prayer times shift a lot" },
        { type: "p", text: "In December, Maghrib falls around 16:30 and Fajr around 5:00. Turn on app notifications and talk to your workplace about prayer breaks in advance." },
        { type: "h2", text: "Wudu with cold water" },
        { type: "p", text: "Warm water is fine for wudu, and the mosque's washing area has hot water. The conditions for wiping over socks (masah) are explained in the study circles." },
        { type: "h2", text: "Heating and bills" },
        { type: "p", text: "A kotatsu or electric blanket is relatively cheap to run; set the air conditioner around 20 degrees. The city's foreign residents desk can explain subsidy schemes." },
      ],
      id: [
        { type: "h2", text: "Waktu salat berubah drastis" },
        { type: "p", text: "Pada Desember, Maghrib sekitar 16:30 dan Subuh sekitar 05:00. Aktifkan notifikasi aplikasi dan bicarakan jeda salat dengan tempat kerja sejak awal." },
        { type: "h2", text: "Wudu dengan air dingin" },
        { type: "p", text: "Air hangat sah untuk wudu, dan tempat wudu masjid tersedia air panas. Syarat mengusap kaus kaki (masah) dibahas di kajian." },
        { type: "h2", text: "Pemanas dan tagihan" },
        { type: "p", text: "Kotatsu atau selimut listrik relatif hemat; atur AC sekitar 20 derajat. Loket warga asing balai kota dapat menjelaskan skema subsidi." },
      ],
    },
    category: "article",
    publishedAt: "2026-11-05T03:00:00.000Z",
    author: "Tim Media Al Muttaqin",
    tags: ["musim-dingin", "pendatang-baru"],
  },
];
