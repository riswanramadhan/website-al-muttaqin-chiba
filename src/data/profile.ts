import type { MosqueProfile, BoardMember, TimelineItem, Facility } from "@/lib/types";

/**
 * Profil masjid. Nilai yang ditandai PLACEHOLDER menunggu data resmi dari pengurus
 * (lihat docs/CONTENT-TODO.md). Koordinat sementara memakai pusat kota Matsudo.
 */
export const profile: MosqueProfile = {
  name: {
    ja: "アルムッタキーン文化センター",
    en: "Al Muttaqin Cultural Center",
    id: "Al Muttaqin Cultural Center",
  },
  shortName: "Al Muttaqin",
  legalName: {
    ja: "アルムッタキーン文化センター（マスジド・アルムッタキーン）",
    en: "Al Muttaqin Cultural Center (Masjid Al-Muttaqin)",
    id: "Al Muttaqin Cultural Center (Masjid Al-Muttaqin)",
  },
  tagline: {
    ja: "千葉・松戸のモスクとイスラム文化センター",
    en: "A mosque and Islamic cultural center in Matsudo, Chiba",
    id: "Masjid dan pusat budaya Islam di Matsudo, Chiba",
  },
  description: {
    ja: "アルムッタキーン文化センターは、千葉県松戸市にあるモスク兼イスラム文化センターです。礼拝の場であると同時に、改宗者（ムアッラフ）の学びの場、子どもたちのイスラム教育、そして日本の地域社会との対話の拠点として、千葉イスラム文化センターとドンペット・ドゥアファの協力により運営されています。",
    en: "Al Muttaqin Cultural Center is a mosque and Islamic cultural center in Matsudo, Chiba. It is a place of worship, a learning home for new Muslims, a school for children, and a bridge to the local Japanese community, run in partnership between the Chiba Islamic Culture Center and Dompet Dhuafa.",
    id: "Al Muttaqin Cultural Center adalah masjid sekaligus pusat budaya Islam di Matsudo, Chiba. Selain tempat ibadah, ia menjadi rumah belajar muallaf, sekolah bagi anak-anak, dan jembatan dialog dengan masyarakat Jepang, dikelola bersama oleh Chiba Islamic Culture Center dan Dompet Dhuafa.",
  },
  // PLACEHOLDER: alamat jalan lengkap diisi pengurus.
  address: {
    ja: "千葉県松戸市（詳細住所は近日公開）",
    en: "Matsudo City, Chiba Prefecture (full street address to be announced)",
    id: "Kota Matsudo, Prefektur Chiba (alamat lengkap akan diumumkan)",
  },
  postalCode: "271-0092",
  city: { ja: "松戸市", en: "Matsudo", id: "Matsudo" },
  prefecture: { ja: "千葉県", en: "Chiba", id: "Chiba" },
  country: { ja: "日本", en: "Japan", id: "Jepang" },
  coordinates: { lat: 35.7876, lng: 139.9031 },
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=35.7876,139.9031",
  // PLACEHOLDER: nomor resmi pengurus.
  phone: "+81-47-000-0000",
  whatsapp: "+818000000000",
  email: "info@almuttaqinculturalcenter.org",
  website: "https://almuttaqinculturalcenter.org",
  social: {
    youtube: "https://www.youtube.com/@almuttaqin_chiba",
    instagram: "https://www.instagram.com/almuttaqinchiba",
    facebook: "https://www.facebook.com/almuttaqinchiba",
    whatsapp: "https://wa.me/818000000000",
  },
  foundedYear: 2026,
  capacity: 150,
  openingHours: {
    ja: "毎日 ファジュル礼拝の30分前からイシャー礼拝の30分後まで",
    en: "Daily, from 30 minutes before Fajr until 30 minutes after Isha",
    id: "Setiap hari, 30 menit sebelum Subuh hingga 30 menit setelah Isya",
  },
  nearestStations: [
    {
      name: { ja: "JR松戸駅", en: "JR Matsudo Station", id: "Stasiun JR Matsudo" },
      walkMinutes: 12,
      lines: "JR Joban Line, Shin-Keisei Line",
    },
    {
      name: { ja: "松戸駅（新京成線）", en: "Matsudo Station (Shin-Keisei)", id: "Stasiun Matsudo (Shin-Keisei)" },
      walkMinutes: 12,
      lines: "Shin-Keisei Line",
    },
  ],
  partners: [
    {
      name: "Chiba Islamic Culture Center",
      role: {
        ja: "運営団体・地域のダアワ拠点",
        en: "Operating organization and local dawah hub",
        id: "Organisasi pengelola dan pusat dakwah setempat",
      },
      url: "https://cicc-japan.com",
    },
    {
      name: "Dompet Dhuafa",
      role: {
        ja: "建設・教育プログラムの支援パートナー",
        en: "Construction and education program partner",
        id: "Mitra pembangunan dan program pendidikan",
      },
      url: "https://www.dompetdhuafa.org",
    },
    {
      name: "Dompet Dhuafa Japan",
      role: {
        ja: "在日インドネシア人コミュニティとの連携",
        en: "Liaison with the Indonesian community in Japan",
        id: "Penghubung komunitas Indonesia di Jepang",
      },
      url: "https://ddjepang.org",
    },
  ],
};

export const board: BoardMember[] = [
  {
    id: "sugimoto",
    name: "Dr. H. Ach Firman Wahyudi, S.E., M.Sc",
    role: { ja: "代表・ダーイー", en: "Chairman and Dai", id: "Ketua dan Dai" },
    organization: "Chiba Islamic Culture Center",
  },
  {
    id: "secretary",
    name: "PLACEHOLDER: Sekretaris",
    role: { ja: "事務局長", en: "Secretary General", id: "Sekretaris Umum" },
  },
  {
    id: "treasurer",
    name: "PLACEHOLDER: Bendahara",
    role: { ja: "会計責任者", en: "Treasurer", id: "Bendahara" },
  },
  {
    id: "education",
    name: "PLACEHOLDER: Koordinator Pendidikan",
    role: { ja: "教育担当", en: "Education Coordinator", id: "Koordinator Pendidikan" },
  },
  {
    id: "muallaf",
    name: "PLACEHOLDER: Koordinator Muallaf",
    role: { ja: "ムアッラフ支援担当", en: "New Muslim Support Coordinator", id: "Koordinator Pembinaan Muallaf" },
  },
  {
    id: "liaison",
    name: "PLACEHOLDER: Penghubung Komunitas",
    role: { ja: "コミュニティ連携担当", en: "Community Liaison", id: "Penghubung Komunitas" },
    organization: "Dompet Dhuafa Japan",
  },
];

export const timeline: TimelineItem[] = [
  {
    year: "2024",
    title: {
      ja: "松戸にイスラムセンターを作る構想",
      en: "The idea of an Islamic center in Matsudo",
      id: "Gagasan pusat Islam di Matsudo",
    },
    description: {
      ja: "千葉イスラム文化センターが、松戸に住むムスリムと改宗者のための拠点づくりを提案。",
      en: "Chiba Islamic Culture Center proposes a home for Muslims and new converts living around Matsudo.",
      id: "Chiba Islamic Culture Center mengusulkan rumah bersama bagi muslim dan muallaf di sekitar Matsudo.",
    },
  },
  {
    year: "2025",
    title: {
      ja: "準備委員会の発足と土地の選定",
      en: "Preparatory committee and site selection",
      id: "Panitia persiapan dan pemilihan lahan",
    },
    description: {
      ja: "松戸駅から徒歩圏内の土地を選定し、在日インドネシア人コミュニティと日本人ムスリムによる準備委員会が発足。",
      en: "A site within walking distance of Matsudo Station is chosen and a preparatory committee of Indonesian residents and Japanese Muslims is formed.",
      id: "Lahan dalam jarak jalan kaki dari Stasiun Matsudo dipilih dan panitia persiapan dari komunitas Indonesia serta muslim Jepang dibentuk.",
    },
  },
  {
    year: "2026",
    title: {
      ja: "ドンペット・ドゥアファとの協力協定",
      en: "Partnership with Dompet Dhuafa",
      id: "Kolaborasi dengan Dompet Dhuafa",
    },
    description: {
      ja: "ジャカルタで協力協定を締結し、土地取得と建設のためのワクフ募金を開始。",
      en: "A partnership agreement is signed in Jakarta and a waqf campaign for land and construction begins.",
      id: "Kesepakatan kolaborasi ditandatangani di Jakarta dan penggalangan wakaf tanah serta bangunan dimulai.",
    },
  },
  {
    year: "2026",
    title: {
      ja: "モスクの開所",
      en: "The mosque opens its doors",
      id: "Masjid mulai digunakan",
    },
    description: {
      ja: "建物が完成し、集団礼拝・学習会・ムアッラフ支援が始まる。",
      en: "The building is completed and congregational prayers, study circles, and convert support begin.",
      id: "Bangunan selesai; salat berjamaah, kajian, dan pembinaan muallaf dimulai.",
    },
  },
];

export const facilities: Facility[] = [
  {
    id: "prayer-hall",
    name: { ja: "礼拝ホール", en: "Prayer hall", id: "Ruang salat utama" },
    description: {
      ja: "男女別のスペースを備えた最大150名収容の礼拝ホール。",
      en: "A prayer hall for up to 150 people with separate spaces for men and women.",
      id: "Ruang salat untuk 150 jamaah dengan area terpisah untuk laki-laki dan perempuan.",
    },
    icon: "landmark",
  },
  {
    id: "classroom",
    name: { ja: "教室", en: "Classrooms", id: "Ruang kelas" },
    description: {
      ja: "子どものクルアーン教室、ムアッラフ講座、日本語クラスに使用。",
      en: "Used for children's Quran classes, convert courses, and Japanese language classes.",
      id: "Dipakai untuk TPA, kelas muallaf, dan kelas bahasa Jepang.",
    },
    icon: "book",
  },
  {
    id: "wudu",
    name: { ja: "ウドゥー（清め）場", en: "Wudu area", id: "Tempat wudu" },
    description: {
      ja: "男女別の清め場とトイレ。",
      en: "Separate ablution areas and restrooms for men and women.",
      id: "Tempat wudu dan toilet terpisah untuk laki-laki dan perempuan.",
    },
    icon: "droplets",
  },
  {
    id: "kitchen",
    name: { ja: "キッチン・集会スペース", en: "Kitchen and gathering space", id: "Dapur dan ruang kumpul" },
    description: {
      ja: "イフタールや地域イベントのための共用キッチン。",
      en: "A shared kitchen for iftar and community events.",
      id: "Dapur bersama untuk buka puasa dan acara komunitas.",
    },
    icon: "utensils",
  },
  {
    id: "kids",
    name: { ja: "キッズスペース", en: "Kids corner", id: "Area anak" },
    description: {
      ja: "小さな子ども連れの家族のためのスペース。",
      en: "A corner for families with small children.",
      id: "Area untuk keluarga dengan anak kecil.",
    },
    icon: "baby",
  },
  {
    id: "access",
    name: { ja: "バリアフリー", en: "Accessible entrance", id: "Akses ramah difabel" },
    description: {
      ja: "段差のない入口と車椅子対応トイレ。",
      en: "Step-free entrance and an accessible restroom.",
      id: "Pintu masuk tanpa tangga dan toilet ramah kursi roda.",
    },
    icon: "accessibility",
  },
  {
    id: "parking",
    name: { ja: "駐車・駐輪スペース", en: "Parking and bicycle racks", id: "Parkir mobil dan sepeda" },
    description: {
      ja: "数台分の駐車スペースと駐輪場。金曜日とイベント時は公共交通機関をご利用ください。",
      en: "A few car spaces and bicycle racks. On Fridays and during events please come by public transport.",
      id: "Beberapa slot mobil dan rak sepeda. Pada hari Jumat dan saat acara mohon datang dengan transportasi umum.",
    },
    icon: "parking",
  },
  {
    id: "wifi",
    name: { ja: "無料Wi-Fi", en: "Free Wi-Fi", id: "Wi-Fi gratis" },
    description: {
      ja: "来館者向けの無料Wi-Fi。パスワードは受付でご確認ください。",
      en: "Free Wi-Fi for visitors. Ask at the reception desk for the password.",
      id: "Wi-Fi gratis untuk pengunjung. Tanyakan kata sandinya di meja resepsionis.",
    },
    icon: "wifi",
  },
];
