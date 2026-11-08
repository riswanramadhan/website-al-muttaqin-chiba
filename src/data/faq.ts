import type { FaqItem } from "@/lib/types";

/**
 * Pertanyaan umum (PRD-03a). Enam kategori, minimal tiga item per kategori.
 * Id yang sudah dipakai modul lain (faq-location, faq-iqamah, faq-jumuah, faq-donate,
 * faq-visit, faq-newcomer) dipertahankan.
 */
export const faqs: FaqItem[] = [
  // ---------------------------------------------------------------- general
  {
    id: "faq-location",
    category: "general",
    question: { ja: "モスクはどこにありますか？", en: "Where is the mosque?", id: "Di mana lokasi masjid?" },
    answer: {
      ja: "千葉県松戸市にあります。JR松戸駅から徒歩約12分です。詳しい道順はアクセスページをご覧ください。",
      en: "In Matsudo City, Chiba, about 12 minutes on foot from JR Matsudo Station. See the contact page for directions.",
      id: "Di Kota Matsudo, Chiba, sekitar 12 menit jalan kaki dari Stasiun JR Matsudo. Lihat halaman kontak untuk rute.",
    },
  },
  {
    id: "faq-languages",
    category: "general",
    question: { ja: "どの言語で対応していますか？", en: "Which languages do you use?", id: "Bahasa apa saja yang dipakai?" },
    answer: {
      ja: "日本語、英語、インドネシア語で対応しています。金曜の説教はアラビア語と日本語、または英語で行われ、勉強会は内容によって言語が異なります。",
      en: "We work in Japanese, English, and Indonesian. The Friday khutbah is delivered in Arabic with Japanese or English, and study circles vary by topic.",
      id: "Kami melayani dalam bahasa Jepang, Inggris, dan Indonesia. Khutbah Jumat disampaikan dalam bahasa Arab dengan Jepang atau Inggris, sedangkan kajian menyesuaikan tema.",
    },
  },
  {
    id: "faq-who-runs",
    category: "general",
    question: { ja: "誰が運営していますか？", en: "Who runs the center?", id: "Siapa yang mengelola pusat ini?" },
    answer: {
      ja: "千葉イスラム文化センターが運営し、ドンペット・ドゥアファとドンペット・ドゥアファ・ジャパンが建設と教育プログラムを支援しています。運営委員会と会計は毎月公開されます。",
      en: "The Chiba Islamic Culture Center runs the center, with Dompet Dhuafa and Dompet Dhuafa Japan supporting construction and education programs. The board and monthly accounts are published openly.",
      id: "Chiba Islamic Culture Center mengelola pusat ini, didukung Dompet Dhuafa dan Dompet Dhuafa Japan untuk pembangunan dan program pendidikan. Susunan pengurus dan laporan keuangan bulanan dipublikasikan secara terbuka.",
    },
  },
  {
    id: "faq-opening-hours",
    category: "general",
    question: { ja: "モスクは何時に開いていますか？", en: "When is the mosque open?", id: "Jam berapa masjid buka?" },
    answer: {
      ja: "毎日、ファジュル礼拝の30分前からイシャー礼拝の30分後まで開いています。事務局は平日の日中に対応しています。",
      en: "Every day from 30 minutes before Fajr until 30 minutes after Isha. The office is staffed on weekday daytimes.",
      id: "Setiap hari, 30 menit sebelum Subuh hingga 30 menit setelah Isya. Sekretariat melayani pada hari kerja di siang hari.",
    },
  },

  // ---------------------------------------------------------------- prayer
  {
    id: "faq-iqamah",
    category: "prayer",
    question: { ja: "礼拝とイカーマの時間は？", en: "What are the prayer and iqamah times?", id: "Kapan jadwal salat dan iqamah?" },
    answer: {
      ja: "礼拝時間はモスクの座標から自動計算され、イカーマはアザーンの5〜20分後です。礼拝時間ページとアプリで毎日確認できます。",
      en: "Prayer times are calculated from the mosque's coordinates; iqamah follows the adhan by 5 to 20 minutes. Check the prayer times page or the app daily.",
      id: "Waktu salat dihitung dari koordinat masjid; iqamah 5-20 menit setelah azan. Cek halaman jadwal salat atau App setiap hari.",
    },
  },
  {
    id: "faq-jumuah",
    category: "prayer",
    question: { ja: "金曜礼拝は何時ですか？", en: "What time is Jumuah?", id: "Jam berapa salat Jumat?" },
    answer: {
      ja: "説教は12:30に始まります。駐車場が限られているため、公共交通機関でお越しください。",
      en: "The khutbah starts at 12:30. Parking is limited, so please come by public transport.",
      id: "Khutbah dimulai pukul 12:30. Parkir terbatas, mohon datang dengan transportasi umum.",
    },
  },
  {
    id: "faq-women",
    category: "prayer",
    question: { ja: "女性用の礼拝スペースはありますか？", en: "Is there a prayer space for women?", id: "Apakah ada ruang salat untuk perempuan?" },
    answer: {
      ja: "はい。女性専用の礼拝スペース、ウドゥー場、トイレがあります。金曜礼拝やイベントの際もご利用いただけます。",
      en: "Yes. There is a dedicated women's prayer space with its own wudu area and restroom, available at Jumuah and during events.",
      id: "Ya. Tersedia ruang salat khusus perempuan dengan tempat wudu dan toilet sendiri, termasuk saat salat Jumat dan acara.",
    },
  },
  {
    id: "faq-eid",
    category: "prayer",
    question: { ja: "イードの礼拝はどこで行われますか？", en: "Where is the Eid prayer held?", id: "Di mana salat Id dilaksanakan?" },
    answer: {
      ja: "参加者が多いため、イード礼拝は複数回に分けて行うか、近隣の会場を借りて行います。日時はお知らせとアプリの通知で事前に発表します。",
      en: "Because attendance is high, the Eid prayer is held in several sessions or at a nearby rented venue. The date and time are announced in advance on the news page and through app notifications.",
      id: "Karena jamaah sangat banyak, salat Id dilaksanakan dalam beberapa gelombang atau di aula sewaan terdekat. Tanggal dan waktunya diumumkan lebih dulu lewat halaman berita dan notifikasi App.",
    },
  },

  // ---------------------------------------------------------------- donation
  {
    id: "faq-donate",
    category: "donation",
    question: { ja: "寄付はどうすればいいですか？", en: "How can I donate?", id: "Bagaimana cara berinfaq?" },
    answer: {
      ja: "日本円はゆうちょ銀行、ルピアはQRISで受け付けています。送金後に確認フォームを送っていただくと、毎月の報告に反映されます。",
      en: "Yen via Japan Post Bank, Rupiah via QRIS. Submit the confirmation form after transferring so it appears in the monthly report.",
      id: "Yen lewat Japan Post Bank, Rupiah lewat QRIS. Isi formulir konfirmasi setelah transfer agar tercatat di laporan bulanan.",
    },
  },
  {
    id: "faq-donation-report",
    category: "donation",
    question: { ja: "寄付の使い道はどこで確認できますか？", en: "How do I know how donations are used?", id: "Bagaimana saya tahu donasi digunakan untuk apa?" },
    answer: {
      ja: "毎月、収入と支出をまとめた会計報告を透明性ページで公開しています。大きな支出は理由とともに記載します。",
      en: "A monthly financial report with all income and expenses is published on the financial reports page. Major expenses are listed with an explanation.",
      id: "Setiap bulan laporan keuangan berisi seluruh pemasukan dan pengeluaran dipublikasikan di halaman transparansi. Pengeluaran besar dicantumkan beserta alasannya.",
    },
  },
  {
    id: "faq-zakat",
    category: "donation",
    question: { ja: "ザカートやサダカも受け付けていますか？", en: "Do you accept zakat and sadaqah?", id: "Apakah menerima zakat dan sedekah?" },
    answer: {
      ja: "はい。ザカート、サダカ、ワクフ、インファークをそれぞれ別に管理しています。送金時に種類を記載してください。ザカートは対象者にのみ配分されます。",
      en: "Yes. Zakat, sadaqah, waqf, and infaq are tracked separately. Please note the type when you transfer; zakat is distributed only to eligible recipients.",
      id: "Ya. Zakat, sedekah, wakaf, dan infaq dicatat terpisah. Mohon tulis jenisnya saat transfer; zakat hanya disalurkan kepada mustahik.",
    },
  },
  {
    id: "faq-donation-receipt",
    category: "donation",
    question: { ja: "領収書は発行できますか？", en: "Can I get a receipt?", id: "Apakah bisa mendapat bukti donasi?" },
    answer: {
      ja: "はい。確認フォームで領収書を希望すると、事務局からメールでお送りします。現在、税控除の対象ではありません。",
      en: "Yes. Tick the receipt option on the confirmation form and the office will email one. Donations are not yet tax-deductible in Japan.",
      id: "Ya. Centang pilihan bukti donasi pada formulir konfirmasi dan sekretariat akan mengirimkannya lewat email. Donasi saat ini belum dapat dikurangkan dari pajak di Jepang.",
    },
  },

  // ---------------------------------------------------------------- newcomer
  {
    id: "faq-newcomer",
    category: "newcomer",
    question: { ja: "千葉に引っ越してきたばかりです。何から始めればいいですか？", en: "I just moved to Chiba. Where do I start?", id: "Saya baru pindah ke Chiba. Mulai dari mana?" },
    answer: {
      ja: "新しく来た方のための案内ページで、市役所の手続き、ゴミの出し方、ハラール食品、交通について説明しています。WhatsAppグループにもぜひご参加ください。",
      en: "Start with the newcomer guide: city hall registration, garbage rules, halal food, and transport. Join our WhatsApp group as well.",
      id: "Mulai dari panduan muslim baru: lapor diri di balai kota, aturan sampah, makanan halal, dan transportasi. Bergabunglah juga ke grup WhatsApp jamaah.",
    },
  },
  {
    id: "faq-halal-food",
    category: "newcomer",
    question: { ja: "近くでハラール食品はどこで買えますか？", en: "Where can I buy halal food nearby?", id: "Di mana bisa membeli makanan halal di sekitar sini?" },
    answer: {
      ja: "ハラールガイドのページに、松戸周辺のハラール食材店とレストランの地図を掲載しています。成分表示で避けるべき漢字の一覧もあります。",
      en: "The halal guide page has a map of halal grocers and restaurants around Matsudo, plus a list of kanji to avoid on ingredient labels.",
      id: "Halaman panduan halal memuat peta toko bahan makanan dan restoran halal di sekitar Matsudo, serta daftar kanji yang perlu dihindari pada label bahan.",
    },
  },
  {
    id: "faq-whatsapp-group",
    category: "newcomer",
    question: { ja: "ジャマーアのWhatsAppグループに入るには？", en: "How do I join the community WhatsApp group?", id: "Bagaimana cara bergabung ke grup WhatsApp jamaah?" },
    answer: {
      ja: "お問い合わせページのWhatsAppボタンから事務局にメッセージを送ってください。お名前と居住エリアを確認したうえで招待します。",
      en: "Message the office through the WhatsApp button on the contact page. We confirm your name and area before sending an invitation.",
      id: "Kirim pesan ke sekretariat lewat tombol WhatsApp di halaman kontak. Kami akan mengonfirmasi nama dan area tempat tinggal sebelum mengirim undangan.",
    },
  },

  // ---------------------------------------------------------------- program
  {
    id: "faq-tpa",
    category: "program",
    question: { ja: "子どものクルアーン教室はいつありますか？", en: "When are the children's Quran classes?", id: "Kapan jadwal TPA untuk anak-anak?" },
    answer: {
      ja: "毎週土曜の午後に開催しています。4歳から12歳が対象で、クルアーンの読み方、暗唱、礼拝の基本を学びます。登録はプログラムページから行えます。",
      en: "Every Saturday afternoon, for ages 4 to 12: Quran reading, memorization, and the basics of prayer. Register on the programs page.",
      id: "Setiap Sabtu siang untuk usia 4-12 tahun: membaca Al-Quran, hafalan, dan dasar-dasar salat. Pendaftaran lewat halaman program.",
    },
  },
  {
    id: "faq-muallaf-class",
    category: "program",
    question: { ja: "イスラムに改宗したばかりです。学べる場はありますか？", en: "I recently became Muslim. Is there a class for me?", id: "Saya baru masuk Islam. Apakah ada kelas untuk saya?" },
    answer: {
      ja: "はい。ムアッラフ講座では、礼拝の仕方、ウドゥー、基本的な信仰について日本語で少人数で学べます。シャハーダの立ち会いもお手伝いします。",
      en: "Yes. The new Muslim course covers prayer, wudu, and the basics of faith in small groups, in Japanese. We can also help with taking the shahada.",
      id: "Ya. Kelas muallaf membahas tata cara salat, wudu, dan dasar akidah dalam kelompok kecil berbahasa Jepang. Kami juga membantu prosesi syahadat.",
    },
  },
  {
    id: "faq-japanese-class",
    category: "program",
    question: { ja: "日本語クラスは誰でも参加できますか？", en: "Can anyone join the Japanese class?", id: "Apakah semua orang boleh ikut kelas bahasa Jepang?" },
    answer: {
      ja: "はい。日本に来たばかりのムスリムを主な対象とした無料クラスで、生活に必要な会話と市役所・病院で使う表現を学びます。ボランティア講師も募集しています。",
      en: "Yes. The free class is aimed at Muslims new to Japan and covers everyday conversation and phrases for city hall and hospital visits. Volunteer teachers are welcome.",
      id: "Ya. Kelas gratis ini terutama untuk muslim yang baru tiba di Jepang: percakapan sehari-hari dan ungkapan untuk urusan balai kota dan rumah sakit. Kami juga membuka kesempatan relawan pengajar.",
    },
  },
  {
    id: "faq-room-booking",
    category: "program",
    question: { ja: "部屋を借りてイベントを開催できますか？", en: "Can I book a room for an event?", id: "Bisakah meminjam ruangan untuk acara?" },
    answer: {
      ja: "はい。教室や集会スペースは、アキーカや勉強会などイスラムの趣旨に沿った集まりに貸し出しています。予約ページから申し込んでください。",
      en: "Yes. Classrooms and the gathering space can be booked for gatherings in keeping with Islamic values, such as aqiqah or study sessions. Apply through the booking page.",
      id: "Ya. Ruang kelas dan ruang kumpul dapat dipinjam untuk kegiatan yang sesuai nilai Islam, seperti akikah atau kajian. Ajukan lewat halaman peminjaman ruang.",
    },
  },

  // ---------------------------------------------------------------- visit
  {
    id: "faq-visit",
    category: "visit",
    question: { ja: "ムスリムでなくても見学できますか？", en: "Can non-Muslims visit?", id: "Bolehkah non-muslim berkunjung?" },
    answer: {
      ja: "もちろんです。毎月のオープンモスクデーのほか、事前にご連絡いただければいつでもご案内します。肩と膝が隠れる服装でお越しください。",
      en: "Of course. Join a monthly Open Mosque Day or contact us for a visit any time. Please wear clothing that covers shoulders and knees.",
      id: "Tentu. Ikuti Open Mosque Day bulanan atau hubungi kami untuk kunjungan kapan saja. Mohon berpakaian menutup bahu dan lutut.",
    },
  },
  {
    id: "faq-etiquette",
    category: "visit",
    question: { ja: "見学のときに気をつけることはありますか？", en: "What should I know before visiting?", id: "Apa yang perlu diperhatikan saat berkunjung?" },
    answer: {
      ja: "入口で靴を脱ぎ、礼拝中の方の前を横切らないようにしてください。写真撮影はスタッフにご確認ください。女性の方はスカーフをお持ちいただくか、貸出用をご利用ください。",
      en: "Remove your shoes at the entrance and avoid walking in front of people who are praying. Ask staff before taking photos. Women may bring a scarf or borrow one from us.",
      id: "Lepas sepatu di pintu masuk dan hindari lewat di depan orang yang sedang salat. Tanyakan kepada petugas sebelum memotret. Pengunjung perempuan dapat membawa kerudung atau meminjam dari kami.",
    },
  },
  {
    id: "faq-school-visit",
    category: "visit",
    question: { ja: "学校や団体での見学はできますか？", en: "Do you host school or group visits?", id: "Apakah menerima kunjungan sekolah atau rombongan?" },
    answer: {
      ja: "はい。学校、自治会、企業向けに、イスラムの基礎と礼拝の見学を含む1〜2時間のプログラムを用意しています。お問い合わせフォームから「見学」を選んでご連絡ください。",
      en: "Yes. We offer a one to two hour program for schools, neighborhood associations, and companies, including an introduction to Islam and watching a prayer. Choose \"Visit\" on the contact form.",
      id: "Ya. Kami menyediakan program 1-2 jam untuk sekolah, RT/RW setempat, dan perusahaan, termasuk pengenalan Islam dan menyaksikan salat. Pilih subjek \"Kunjungan\" pada formulir kontak.",
    },
  },
  {
    id: "faq-parking",
    category: "visit",
    question: { ja: "駐車場はありますか？", en: "Is there parking?", id: "Apakah ada tempat parkir?" },
    answer: {
      ja: "駐車スペースは数台分のみで、金曜日とイベント時は利用できません。駐輪場はあります。公共交通機関か近隣のコインパーキングをご利用ください。",
      en: "Only a few car spaces, and none on Fridays or during events. Bicycle parking is available. Please use public transport or a nearby paid car park.",
      id: "Hanya tersedia beberapa slot mobil, dan tidak tersedia pada hari Jumat atau saat acara. Parkir sepeda tersedia. Mohon gunakan transportasi umum atau parkir berbayar di sekitar.",
    },
  },
];
