import type { Program, Room } from "@/lib/types";

export const programs: Program[] = [
  {
    id: "tpa",
    slug: "tpa",
    title: { ja: "子どもクルアーン教室（TPA）", en: "Children's Quran class (TPA)", id: "TPA (Taman Pendidikan Al-Qur'an)" },
    excerpt: {
      ja: "4歳から12歳の子どもがクルアーン読誦、ドゥアー、イスラームの基礎を学びます。",
      en: "Children aged 4 to 12 learn Quran reading, duas, and the basics of Islam.",
      id: "Anak usia 4-12 tahun belajar membaca Al-Qur'an, doa, dan dasar-dasar Islam.",
    },
    description: {
      ja: [
        { type: "p", text: "年齢別の3クラスで、イクロからクルアーン読誦、短い章の暗記、礼拝の実践までを学びます。" },
        { type: "ul", items: ["年少クラス（4〜6歳）：ひらがな・アラビア文字入門、短いドゥアー", "年中クラス（7〜9歳）：イクロ、ジュズ・アンマの暗記", "年長クラス（10〜12歳）：タジュウィード、礼拝とイスラームの基礎"] },
      ],
      en: [
        { type: "p", text: "Three age-based classes from Iqra to Quran reading, memorising short surahs, and practising prayer." },
        { type: "ul", items: ["Juniors (4 to 6): Arabic letters and short duas", "Middle (7 to 9): Iqra and Juz Amma memorisation", "Seniors (10 to 12): tajwid, prayer, and basics of Islam"] },
      ],
      id: [
        { type: "p", text: "Tiga kelas sesuai usia, dari Iqra sampai tahsin, hafalan surat pendek, dan praktik salat." },
        { type: "ul", items: ["Kelas kecil (4-6): huruf hijaiyah dan doa pendek", "Kelas tengah (7-9): Iqra dan hafalan Juz Amma", "Kelas besar (10-12): tajwid, salat, dan dasar Islam"] },
      ],
    },
    schedule: { ja: "毎週日曜日 10:00〜11:30", en: "Every Sunday, 10:00 to 11:30", id: "Setiap Minggu, 10:00-11:30" },
    audience: { ja: "4〜12歳の子ども", en: "Children aged 4 to 12", id: "Anak usia 4-12 tahun" },
    languages: ["id", "ja", "en"],
    icon: "book-open",
    registrationOpen: true,
    contactPerson: "Koordinator Pendidikan",
  },
  {
    id: "muallaf-class",
    slug: "kelas-muallaf",
    title: { ja: "ムアッラフ講座", en: "New Muslim course", id: "Kelas muallaf" },
    excerpt: {
      ja: "日本語でイスラームの基礎を学ぶ全8回の講座。改宗を考えている方も歓迎。",
      en: "An eight-session course on the basics of Islam in Japanese, open to anyone considering Islam.",
      id: "Kursus 8 pertemuan tentang dasar Islam dalam bahasa Jepang, terbuka bagi yang sedang mempelajari Islam.",
    },
    description: {
      ja: [
        { type: "p", text: "信仰の柱、清め、礼拝、断食、日常の倫理を、日本語でやさしく学びます。一人ひとりに相談役（メンター）がつきます。" },
        { type: "ol", items: ["イスラームとは：神、預言者、啓典", "信仰の六つの柱", "清め（ウドゥー・グスル）", "礼拝の方法と一日の流れ", "断食とラマダーン", "ザカートと喜捨", "日本での食事・仕事・家族", "シャハーダとその後の歩み"] },
        { type: "callout", title: "途中参加できます", text: "各回は独立した内容です。見学だけでも歓迎します。" },
      ],
      en: [
        { type: "p", text: "Pillars of faith, purification, prayer, fasting, and daily ethics taught gently in Japanese. Each participant is paired with a mentor." },
        { type: "ol", items: ["What is Islam: God, prophets, scripture", "The six pillars of faith", "Purification (wudu and ghusl)", "How to pray and the daily rhythm", "Fasting and Ramadan", "Zakat and charity", "Food, work, and family in Japan", "The shahada and the steps after it"] },
        { type: "callout", title: "Join any time", text: "Each session stands on its own. You are welcome to simply sit in and observe." },
      ],
      id: [
        { type: "p", text: "Rukun iman, bersuci, salat, puasa, dan akhlak sehari-hari dalam bahasa Jepang yang mudah. Setiap peserta didampingi seorang mentor." },
        { type: "ol", items: ["Apa itu Islam: Allah, para nabi, kitab suci", "Enam rukun iman", "Bersuci (wudu dan mandi wajib)", "Cara salat dan ritme harian", "Puasa dan Ramadan", "Zakat dan sedekah", "Makanan, kerja, dan keluarga di Jepang", "Syahadat dan langkah setelahnya"] },
        { type: "callout", title: "Boleh bergabung kapan saja", text: "Setiap pertemuan berdiri sendiri. Sekadar menyimak pun dipersilakan." },
      ],
    },
    schedule: { ja: "毎週日曜日 14:00〜15:30", en: "Every Sunday, 14:00 to 15:30", id: "Setiap Minggu, 14:00-15:30" },
    audience: { ja: "改宗者・入門者とそのご家族", en: "New Muslims, seekers, and their families", id: "Muallaf, pencari, dan keluarganya" },
    languages: ["ja"],
    icon: "heart-handshake",
    registrationOpen: true,
    contactPerson: "Sensei Kyoichiro Sugimoto",
  },
  {
    id: "japanese-class",
    slug: "kelas-bahasa-jepang",
    title: { ja: "日本語クラス", en: "Japanese language class", id: "Kelas bahasa Jepang" },
    excerpt: {
      ja: "新しく日本に来たムスリムのための生活日本語。ボランティア講師が担当。",
      en: "Everyday Japanese for Muslims new to Japan, taught by volunteer teachers.",
      id: "Bahasa Jepang sehari-hari untuk muslim yang baru tiba, diajar relawan.",
    },
    description: {
      ja: [{ type: "p", text: "市役所、病院、職場で使う日本語を中心に、初級と中級の2クラス。" }],
      en: [{ type: "p", text: "Two levels, beginner and intermediate, focused on Japanese for city hall, hospitals, and the workplace." }],
      id: [{ type: "p", text: "Dua tingkat, pemula dan menengah, fokus pada bahasa Jepang untuk balai kota, rumah sakit, dan tempat kerja." }],
    },
    schedule: { ja: "毎週水曜日 19:30〜21:00", en: "Every Wednesday, 19:30 to 21:00", id: "Setiap Rabu, 19:30-21:00" },
    audience: { ja: "日本語を学びたいムスリム", en: "Muslims who want to learn Japanese", id: "Muslim yang ingin belajar bahasa Jepang" },
    languages: ["ja", "en", "id"],
    icon: "languages",
    registrationOpen: true,
    contactPerson: "Koordinator Kelas Bahasa Jepang",
  },
  {
    id: "open-mosque",
    slug: "open-mosque",
    title: { ja: "オープンモスク", en: "Open Mosque", id: "Open Mosque" },
    excerpt: {
      ja: "毎月第3土曜日、どなたでもモスクを見学できる日。",
      en: "Every third Saturday, the mosque opens its doors to everyone.",
      id: "Setiap Sabtu ketiga, masjid terbuka untuk siapa saja.",
    },
    description: {
      ja: [{ type: "p", text: "礼拝の見学、建物の案内、ハラール軽食、質疑応答。学校や団体の見学も受け付けています。" }],
      en: [{ type: "p", text: "Prayer demonstration, building tour, halal snacks, and Q&A. School and group visits are welcome." }],
      id: [{ type: "p", text: "Demo salat, tur gedung, camilan halal, dan tanya jawab. Kunjungan sekolah dan kelompok dipersilakan." }],
    },
    schedule: { ja: "毎月第3土曜日 13:00〜16:00", en: "Third Saturday of the month, 13:00 to 16:00", id: "Sabtu ketiga setiap bulan, 13:00-16:00" },
    audience: { ja: "近隣住民、学校、団体", en: "Neighbours, schools, and groups", id: "Warga sekitar, sekolah, dan kelompok" },
    languages: ["ja", "en"],
    icon: "door-open",
    registrationOpen: true,
    contactPerson: "Tim Open Mosque",
  },
  {
    id: "school-visit",
    slug: "kunjungan-sekolah",
    title: { ja: "学校・団体見学", en: "School and group visits", id: "Kunjungan sekolah dan kelompok" },
    excerpt: {
      ja: "国際理解教育の一環として、学校や自治体からの見学を受け入れています。",
      en: "We welcome visits from schools and local organisations as part of intercultural education.",
      id: "Kami menerima kunjungan sekolah dan lembaga setempat sebagai bagian pendidikan lintas budaya.",
    },
    description: {
      ja: [{ type: "p", text: "所要時間は60〜90分。礼拝の説明、イスラームとムスリムの生活についての講話、質疑応答を行います。" }],
      en: [{ type: "p", text: "A 60 to 90 minute visit with a prayer explanation, a talk on Islam and Muslim life, and Q&A." }],
      id: [{ type: "p", text: "Kunjungan 60-90 menit dengan penjelasan salat, ceramah tentang Islam dan kehidupan muslim, serta tanya jawab." }],
    },
    schedule: { ja: "平日・要予約", en: "Weekdays, by appointment", id: "Hari kerja, dengan perjanjian" },
    audience: { ja: "学校、大学、自治体、企業", en: "Schools, universities, municipalities, and companies", id: "Sekolah, universitas, pemerintah daerah, dan perusahaan" },
    languages: ["ja", "en"],
    icon: "school",
    registrationOpen: true,
    contactPerson: "Sensei Kyoichiro Sugimoto",
  },
  {
    id: "weekly-kajian",
    slug: "kajian-pekanan",
    title: { ja: "毎週の勉強会", en: "Weekly study circle", id: "Kajian pekanan" },
    excerpt: {
      ja: "毎週土曜日のマグリブ後、3言語で交互に開催。",
      en: "Every Saturday after Maghrib, rotating between three languages.",
      id: "Setiap Sabtu ba'da Maghrib, bergantian dalam tiga bahasa.",
    },
    description: {
      ja: [{ type: "p", text: "アキーダ、フィクフ、シーラ、タフスィールをテーマごとに学びます。録画はYouTubeで公開。" }],
      en: [{ type: "p", text: "Aqidah, fiqh, sirah, and tafsir by theme. Recordings are published on YouTube." }],
      id: [{ type: "p", text: "Akidah, fikih, sirah, dan tafsir per tema. Rekaman dipublikasikan di YouTube." }],
    },
    schedule: { ja: "毎週土曜日 マグリブ後", en: "Every Saturday after Maghrib", id: "Setiap Sabtu ba'da Maghrib" },
    audience: { ja: "どなたでも", en: "Everyone", id: "Semua jamaah" },
    languages: ["id", "ja", "en"],
    icon: "mic",
    registrationOpen: false,
    contactPerson: "Koordinator Kajian",
  },
  {
    id: "youth",
    slug: "youth",
    title: { ja: "ユース（青少年）プログラム", en: "Youth programme", id: "Program remaja (Youth)" },
    excerpt: {
      ja: "13〜22歳のムスリム青少年のための学びと交流の場。月2回、土曜日の午後に開催。",
      en: "Learning and friendship for Muslim teens and students aged 13 to 22, twice a month on Saturday afternoons.",
      id: "Wadah belajar dan silaturahmi remaja muslim usia 13-22 tahun, dua kali sebulan pada Sabtu sore.",
    },
    description: {
      ja: [
        { type: "p", text: "学校や職場で少数派として暮らす若いムスリムが、安心して話し合い、学び、友だちをつくるためのプログラムです。" },
        { type: "ul", items: ["ハラカ（少人数の学習会）：アキーダ、シーラ、日本での信仰生活", "メンタリング：進学・就職・家族についての相談", "スポーツ・ボランティア・地域イベントへの参加"] },
        { type: "p", text: "日本語、英語、インドネシア語が混ざった環境です。どの言語でも参加できます。" },
      ],
      en: [
        { type: "p", text: "A programme where young Muslims who are a minority at school or work can talk freely, learn, and make friends." },
        { type: "ul", items: ["Halaqah (small study groups): aqidah, sirah, and living as a Muslim in Japan", "Mentoring: study, career, and family questions", "Sports, volunteering, and joining community events"] },
        { type: "p", text: "Japanese, English, and Indonesian are mixed freely. Join in whichever language you prefer." },
      ],
      id: [
        { type: "p", text: "Program bagi remaja muslim yang menjadi minoritas di sekolah atau tempat kerja agar bisa berdiskusi, belajar, dan berteman dengan nyaman." },
        { type: "ul", items: ["Halaqah (kelompok belajar kecil): akidah, sirah, dan hidup sebagai muslim di Jepang", "Mentoring: konsultasi studi, karier, dan keluarga", "Olahraga, kerja bakti, dan ikut acara komunitas"] },
        { type: "p", text: "Bahasa Jepang, Inggris, dan Indonesia dipakai bergantian. Ikut saja dengan bahasa yang kamu suka." },
      ],
    },
    schedule: { ja: "第2・第4土曜日 15:00〜17:00", en: "2nd and 4th Saturday, 15:00 to 17:00", id: "Sabtu ke-2 dan ke-4, 15:00-17:00" },
    audience: { ja: "13〜22歳のムスリム青少年", en: "Muslim youth aged 13 to 22", id: "Remaja muslim usia 13-22 tahun" },
    languages: ["ja", "en", "id"],
    icon: "users",
    registrationOpen: true,
    contactPerson: "Koordinator Youth",
  },
];

export const rooms: Room[] = [
  {
    id: "hall",
    name: { ja: "多目的ホール", en: "Multipurpose hall", id: "Aula serbaguna" },
    capacity: 80,
    description: {
      ja: "結婚式（アカド・ニカー）、アキーカ、講演会、地域イベントに。",
      en: "For wedding contracts (akad nikah), aqiqah, talks, and community events.",
      id: "Untuk akad nikah, akikah, ceramah, dan acara komunitas.",
    },
    amenities: [
      { ja: "音響・マイク", en: "Sound system and microphone", id: "Sound system dan mikrofon" },
      { ja: "プロジェクター", en: "Projector", id: "Proyektor" },
      { ja: "キッチン利用可", en: "Kitchen access", id: "Akses dapur" },
    ],
    availableFor: [
      { ja: "アカド・ニカー", en: "Akad nikah", id: "Akad nikah" },
      { ja: "アキーカ・タシャックラン", en: "Aqiqah and gatherings", id: "Akikah dan tasyakuran" },
      { ja: "セミナー", en: "Seminars", id: "Seminar" },
    ],
  },
  {
    id: "classroom",
    name: { ja: "教室", en: "Classroom", id: "Ruang kelas" },
    capacity: 20,
    description: {
      ja: "少人数の勉強会、会議、個別相談に。",
      en: "For small study groups, meetings, and consultations.",
      id: "Untuk kelompok belajar kecil, rapat, dan konsultasi.",
    },
    amenities: [
      { ja: "ホワイトボード", en: "Whiteboard", id: "Papan tulis" },
      { ja: "Wi-Fi", en: "Wi-Fi", id: "Wi-Fi" },
    ],
    availableFor: [
      { ja: "勉強会", en: "Study groups", id: "Kelompok belajar" },
      { ja: "会議", en: "Meetings", id: "Rapat" },
    ],
  },
];
