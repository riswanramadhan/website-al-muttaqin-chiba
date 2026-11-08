import type { HadithOfTheDay } from "@/lib/types";

/** Hadis harian, dipilih deterministik berdasarkan hari dalam tahun. */
export const hadiths: HadithOfTheDay[] = [
  {
    id: "h-niat",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    text: {
      ja: "行いは意図によって決まる。",
      en: "Actions are judged by intentions.",
      id: "Sesungguhnya amal itu tergantung niatnya.",
    },
    source: "HR. Bukhari 1, Muslim 1907",
  },
  {
    id: "h-tetangga",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ",
    text: {
      ja: "アッラーと最後の日を信じる者は、隣人を大切にしなさい。",
      en: "Whoever believes in Allah and the Last Day, let him honour his neighbour.",
      id: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tetangganya.",
    },
    source: "HR. Bukhari 6018, Muslim 47",
  },
  {
    id: "h-senyum",
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    text: {
      ja: "兄弟に向ける微笑みは、あなたにとってのサダカ（施し）である。",
      en: "Your smile for your brother is charity.",
      id: "Senyummu di hadapan saudaramu adalah sedekah.",
    },
    source: "HR. Tirmidzi 1956",
  },
  {
    id: "h-ilmu",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    text: {
      ja: "知識を求めて道を歩む者に、アッラーは楽園への道を容易にしてくださる。",
      en: "Whoever follows a path in search of knowledge, Allah will make easy for him a path to Paradise.",
      id: "Barangsiapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga.",
    },
    source: "HR. Muslim 2699",
  },
  {
    id: "h-sedekah",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    text: {
      ja: "施しによって財産が減ることはない。",
      en: "Charity does not decrease wealth.",
      id: "Sedekah tidak mengurangi harta.",
    },
    source: "HR. Muslim 2588",
  },
  {
    id: "h-akhlak",
    arabic: "إِنَّ مِنْ أَحَبِّكُمْ إِلَيَّ أَحْسَنَكُمْ أَخْلاقًا",
    text: {
      ja: "私にとって最も愛しいのは、最も良い品性を持つ者である。",
      en: "The most beloved of you to me are those with the best character.",
      id: "Sesungguhnya yang paling aku cintai di antara kalian adalah yang paling baik akhlaknya.",
    },
    source: "HR. Bukhari 3759",
  },
  {
    id: "h-mudah",
    arabic: "يَسِّرُوا وَلا تُعَسِّرُوا وَبَشِّرُوا وَلا تُنَفِّرُوا",
    text: {
      ja: "容易にせよ、困難にするな。喜ばせよ、遠ざけるな。",
      en: "Make things easy and do not make them difficult; give glad tidings and do not drive people away.",
      id: "Permudahlah dan jangan mempersulit, berilah kabar gembira dan jangan membuat lari.",
    },
    source: "HR. Bukhari 69, Muslim 1734",
  },
];
