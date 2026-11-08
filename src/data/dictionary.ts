import type { DictionaryEntry } from "@/lib/types";

/**
 * Kamus dakwah: istilah Jepang yang membantu jamaah menjelaskan kebutuhan ibadah,
 * makanan, urusan harian, dan keadaan darurat kepada orang Jepang.
 * Lima kategori: worship, food, daily, emergency, phrases (PRD-08a).
 */
export const dictionary: DictionaryEntry[] = [
  // ---------------------------------------------------------------- worship
  {
    id: "dict-reihai",
    category: "worship",
    japanese: "礼拝",
    reading: "れいはい (reihai)",
    meaning: { ja: "イスラームの礼拝（サラート）", en: "Prayer (salah)", id: "Salat" },
    example: {
      ja: "すみません、礼拝をするための静かな場所はありますか？",
      translation: { ja: "礼拝場所を尋ねる", en: "Excuse me, is there a quiet place where I can pray?", id: "Permisi, apakah ada tempat tenang untuk salat?" },
    },
  },
  {
    id: "dict-danjiki",
    category: "worship",
    japanese: "断食",
    reading: "だんじき (danjiki)",
    meaning: { ja: "ラマダーン月などの断食（サウム）", en: "Fasting (sawm)", id: "Puasa" },
    example: {
      ja: "今月は断食月なので、日中は飲食できません。",
      translation: { ja: "断食を説明する", en: "This month is the fasting month, so I cannot eat or drink during the day.", id: "Bulan ini bulan puasa, jadi saya tidak makan dan minum di siang hari." },
    },
  },
  {
    id: "dict-kinyou",
    category: "worship",
    japanese: "金曜礼拝",
    reading: "きんようれいはい (kin'yō reihai)",
    meaning: { ja: "金曜日の集団礼拝（ジュムア）", en: "Friday congregational prayer (Jumuah)", id: "Salat Jumat" },
    example: {
      ja: "金曜日の昼に1時間ほど礼拝のために外出してもよいでしょうか。",
      translation: { ja: "職場で金曜礼拝の許可を求める", en: "May I step out for about an hour on Friday noon for prayer?", id: "Bolehkah saya keluar sekitar satu jam pada Jumat siang untuk salat?" },
    },
  },
  {
    id: "dict-mosuku",
    category: "worship",
    japanese: "モスク",
    reading: "もすく (mosuku)",
    meaning: { ja: "イスラームの礼拝堂（マスジド）", en: "Mosque (masjid)", id: "Masjid" },
    example: {
      ja: "この近くにモスクはありますか？",
      translation: { ja: "モスクの場所を尋ねる", en: "Is there a mosque near here?", id: "Apakah ada masjid di dekat sini?" },
    },
  },
  {
    id: "dict-reihaishitsu",
    category: "worship",
    japanese: "礼拝室",
    reading: "れいはいしつ (reihaishitsu)",
    meaning: { ja: "祈祷室・プレイヤールーム", en: "Prayer room", id: "Musala / ruang salat" },
    example: {
      ja: "この建物に礼拝室はありますか？",
      translation: { ja: "礼拝室の有無を尋ねる", en: "Is there a prayer room in this building?", id: "Apakah ada musala di gedung ini?" },
    },
  },
  {
    id: "dict-kibura",
    category: "worship",
    japanese: "礼拝の方角",
    reading: "れいはいのほうがく (reihai no hōgaku)",
    meaning: { ja: "キブラ（メッカの方角）", en: "Qibla (the direction of Makkah)", id: "Arah kiblat" },
    example: {
      ja: "メッカの方角はどちらですか？",
      translation: { ja: "キブラを尋ねる", en: "Which way is Makkah?", id: "Ke arah mana kiblat (Makkah)?" },
    },
  },
  {
    id: "dict-kiyome",
    category: "worship",
    japanese: "清め",
    reading: "きよめ (kiyome)",
    meaning: { ja: "ウドゥー（礼拝前の洗浄）", en: "Ablution (wudu)", id: "Wudu" },
    example: {
      ja: "礼拝の前に手と足を洗いたいのですが、洗面所を使ってもいいですか？",
      translation: { ja: "ウドゥーのために洗面所を借りる", en: "I need to wash my hands and feet before prayer. May I use the washroom?", id: "Saya perlu membasuh tangan dan kaki sebelum salat. Bolehkah memakai wastafel?" },
    },
  },
  {
    id: "dict-ramadan",
    category: "worship",
    japanese: "ラマダーン",
    reading: "らまだーん (ramadān)",
    meaning: { ja: "イスラーム暦9月の断食月", en: "Ramadan, the month of fasting", id: "Bulan Ramadan" },
    example: {
      ja: "ラマダーン中は日没後に食事をします。",
      translation: { ja: "ラマダーンの習慣を説明する", en: "During Ramadan I eat after sunset.", id: "Selama Ramadan saya makan setelah matahari terbenam." },
    },
  },
  {
    id: "dict-iido",
    category: "worship",
    japanese: "イード",
    reading: "いーど (īdo)",
    meaning: { ja: "イスラームの祭日（断食明け・犠牲祭）", en: "Eid, the Islamic festival", id: "Hari raya (Idulfitri / Iduladha)" },
    example: {
      ja: "イードはイスラームの大切な祭日です。その日は休みをいただけますか？",
      translation: { ja: "イードの休暇を願い出る", en: "Eid is an important Islamic holiday. Could I take that day off?", id: "Idul Fitri adalah hari raya penting bagi umat Islam. Bolehkah saya cuti pada hari itu?" },
    },
  },
  {
    id: "dict-shukyo-riyu",
    category: "worship",
    japanese: "宗教上の理由",
    reading: "しゅうきょうじょうのりゆう (shūkyō-jō no riyū)",
    meaning: { ja: "信仰による理由", en: "For religious reasons", id: "Karena alasan agama" },
    example: {
      ja: "宗教上の理由で、お酒は飲めません。",
      translation: { ja: "飲酒を断る", en: "For religious reasons, I do not drink alcohol.", id: "Karena alasan agama, saya tidak minum alkohol." },
    },
  },
  {
    id: "dict-kuruan",
    category: "worship",
    japanese: "クルアーン",
    reading: "くるあーん (kuruān)",
    meaning: { ja: "イスラームの聖典（コーラン）", en: "The Quran", id: "Al-Quran" },
    example: {
      ja: "これはクルアーンというイスラームの聖典です。",
      translation: { ja: "クルアーンを紹介する", en: "This is the Quran, the holy book of Islam.", id: "Ini Al-Quran, kitab suci umat Islam." },
    },
  },

  // ------------------------------------------------------------------- food
  {
    id: "dict-halal",
    category: "food",
    japanese: "ハラール",
    reading: "はらーる (harāru)",
    meaning: { ja: "イスラームで許された食べ物・行い", en: "Permissible under Islamic law", id: "Halal" },
    example: {
      ja: "この料理に豚肉やお酒は入っていますか？",
      translation: { ja: "成分を確認する", en: "Does this dish contain pork or alcohol?", id: "Apakah masakan ini mengandung babi atau alkohol?" },
    },
  },
  {
    id: "dict-butaniku",
    category: "food",
    japanese: "豚肉",
    reading: "ぶたにく (butaniku)",
    meaning: { ja: "豚の肉", en: "Pork", id: "Daging babi" },
    example: {
      ja: "宗教上の理由で豚肉は食べられません。",
      translation: { ja: "豚肉を断る", en: "I cannot eat pork for religious reasons.", id: "Saya tidak bisa makan daging babi karena alasan agama." },
    },
  },
  {
    id: "dict-genzairyo",
    category: "food",
    japanese: "原材料",
    reading: "げんざいりょう (genzairyō)",
    meaning: { ja: "食品の材料", en: "Ingredients", id: "Bahan baku / komposisi" },
    example: {
      ja: "原材料を確認させていただけますか？",
      translation: { ja: "原材料表示を見せてもらう", en: "May I check the ingredients?", id: "Bolehkah saya melihat daftar bahannya?" },
    },
  },
  {
    id: "dict-arukoru",
    category: "food",
    japanese: "アルコール",
    reading: "あるこーる (arukōru)",
    meaning: { ja: "酒類・アルコール分", en: "Alcohol", id: "Alkohol" },
    example: {
      ja: "この料理にお酒やみりんは使っていますか？",
      translation: { ja: "調理酒の使用を確認する", en: "Is sake or mirin used in this dish?", id: "Apakah masakan ini memakai sake atau mirin?" },
    },
  },
  {
    id: "dict-toriniku",
    category: "food",
    japanese: "鶏肉",
    reading: "とりにく (toriniku)",
    meaning: { ja: "鶏の肉", en: "Chicken", id: "Daging ayam" },
    example: {
      ja: "この鶏肉はハラール認証を受けていますか？",
      translation: { ja: "ハラール認証を確認する", en: "Is this chicken halal certified?", id: "Apakah ayam ini bersertifikat halal?" },
    },
  },
  {
    id: "dict-dashi",
    category: "food",
    japanese: "だし",
    reading: "だし (dashi)",
    meaning: { ja: "スープの出汁（魚・昆布・豚骨など）", en: "Soup stock (may be fish, kelp, or pork bone)", id: "Kaldu (bisa ikan, rumput laut, atau tulang babi)" },
    example: {
      ja: "このスープのだしは何から取っていますか？豚骨は入っていますか？",
      translation: { ja: "だしの材料を尋ねる", en: "What is this soup stock made from? Does it contain pork bone?", id: "Kaldu sup ini dibuat dari apa? Apakah ada tulang babi?" },
    },
  },
  {
    id: "dict-sakana",
    category: "food",
    japanese: "魚",
    reading: "さかな (sakana)",
    meaning: { ja: "魚・魚介類", en: "Fish, seafood", id: "Ikan, makanan laut" },
    example: {
      ja: "魚か野菜だけの料理はありますか？",
      translation: { ja: "安全なメニューを探す", en: "Do you have a dish with only fish or vegetables?", id: "Apakah ada menu yang hanya ikan atau sayur?" },
    },
  },
  {
    id: "dict-nuki",
    category: "food",
    japanese: "抜き",
    reading: "ぬき (nuki)",
    meaning: { ja: "〜を入れないで", en: "Without (an ingredient)", id: "Tanpa (bahan tertentu)" },
    example: {
      ja: "豚肉抜きでお願いできますか？",
      translation: { ja: "豚肉抜きを頼む", en: "Could you make it without pork, please?", id: "Bisa dibuat tanpa daging babi?" },
    },
  },
  {
    id: "dict-bejitarian",
    category: "food",
    japanese: "ベジタリアン",
    reading: "べじたりあん (bejitarian)",
    meaning: { ja: "菜食", en: "Vegetarian", id: "Vegetarian" },
    example: {
      ja: "ベジタリアン向けのメニューはありますか？",
      translation: { ja: "菜食メニューを尋ねる", en: "Do you have a vegetarian menu?", id: "Apakah ada menu vegetarian?" },
    },
  },
  {
    id: "dict-mochikaeri",
    category: "food",
    japanese: "持ち帰り",
    reading: "もちかえり (mochikaeri)",
    meaning: { ja: "テイクアウト", en: "Takeaway", id: "Bawa pulang (takeaway)" },
    example: {
      ja: "持ち帰りはできますか？",
      translation: { ja: "持ち帰りを頼む", en: "Can I take this away?", id: "Apakah bisa dibungkus untuk dibawa pulang?" },
    },
  },
  {
    id: "dict-zerachin",
    category: "food",
    japanese: "ゼラチン",
    reading: "ぜらちん (zerachin)",
    meaning: { ja: "ゼラチン（多くは豚由来）", en: "Gelatin (often pork-derived)", id: "Gelatin (sering dari babi)" },
    example: {
      ja: "このお菓子のゼラチンは豚由来ですか、魚由来ですか？",
      translation: { ja: "ゼラチンの由来を尋ねる", en: "Is the gelatin in this sweet from pork or from fish?", id: "Gelatin dalam kue ini dari babi atau dari ikan?" },
    },
  },

  // ------------------------------------------------------------------ daily
  {
    id: "dict-shiyakusho",
    category: "daily",
    japanese: "市役所",
    reading: "しやくしょ (shiyakusho)",
    meaning: { ja: "市の行政窓口", en: "City hall", id: "Balai kota" },
    example: {
      ja: "転入届を出したいのですが、窓口はどこですか？",
      translation: { ja: "市役所で窓口を尋ねる", en: "I would like to submit a moving-in notification. Where is the counter?", id: "Saya ingin melapor pindah masuk. Loketnya di mana?" },
    },
  },
  {
    id: "dict-tennyu-todoke",
    category: "daily",
    japanese: "転入届",
    reading: "てんにゅうとどけ (tennyū todoke)",
    meaning: { ja: "引っ越してきたときの住所登録", en: "Moving-in notification (address registration)", id: "Lapor pindah masuk (daftar alamat)" },
    example: {
      ja: "先週松戸に引っ越してきました。転入届をお願いします。",
      translation: { ja: "転入届を提出する", en: "I moved to Matsudo last week. I would like to register my address.", id: "Saya pindah ke Matsudo minggu lalu. Saya ingin mendaftarkan alamat." },
    },
  },
  {
    id: "dict-zairyu-card",
    category: "daily",
    japanese: "在留カード",
    reading: "ざいりゅうかーど (zairyū kādo)",
    meaning: { ja: "外国人の身分証", en: "Residence card", id: "Kartu izin tinggal (zairyu card)" },
    example: {
      ja: "在留カードはこちらです。",
      translation: { ja: "身分証を提示する", en: "Here is my residence card.", id: "Ini kartu izin tinggal saya." },
    },
  },
  {
    id: "dict-mynumber",
    category: "daily",
    japanese: "マイナンバーカード",
    reading: "まいなんばーかーど (mainanbā kādo)",
    meaning: { ja: "個人番号カード", en: "My Number card (individual number card)", id: "Kartu My Number" },
    example: {
      ja: "マイナンバーカードを申請したいです。",
      translation: { ja: "マイナンバーカードを申請する", en: "I would like to apply for a My Number card.", id: "Saya ingin mengajukan kartu My Number." },
    },
  },
  {
    id: "dict-kenko-hoken",
    category: "daily",
    japanese: "健康保険",
    reading: "けんこうほけん (kenkō hoken)",
    meaning: { ja: "医療保険", en: "Health insurance", id: "Asuransi kesehatan" },
    example: {
      ja: "国民健康保険に加入したいのですが。",
      translation: { ja: "健康保険に加入する", en: "I would like to join the National Health Insurance.", id: "Saya ingin mendaftar asuransi kesehatan nasional." },
    },
  },
  {
    id: "dict-gomi",
    category: "daily",
    japanese: "ごみ出し",
    reading: "ごみだし (gomi dashi)",
    meaning: { ja: "ごみを収集場所に出すこと", en: "Putting out the garbage", id: "Membuang sampah ke tempat pengumpulan" },
    example: {
      ja: "燃やせるごみは何曜日に出せばいいですか？",
      translation: { ja: "ごみの日を尋ねる", en: "On which day should I put out burnable garbage?", id: "Hari apa sampah yang bisa dibakar dibuang?" },
    },
  },
  {
    id: "dict-ginko-koza",
    category: "daily",
    japanese: "銀行口座",
    reading: "ぎんこうこうざ (ginkō kōza)",
    meaning: { ja: "預金口座", en: "Bank account", id: "Rekening bank" },
    example: {
      ja: "口座を開設したいのですが、必要な書類は何ですか？",
      translation: { ja: "口座開設に必要なものを尋ねる", en: "I would like to open an account. What documents do I need?", id: "Saya ingin membuka rekening. Dokumen apa yang diperlukan?" },
    },
  },
  {
    id: "dict-eki",
    category: "daily",
    japanese: "駅",
    reading: "えき (eki)",
    meaning: { ja: "電車の駅", en: "Train station", id: "Stasiun kereta" },
    example: {
      ja: "松戸駅へはどう行けばいいですか？",
      translation: { ja: "駅への行き方を尋ねる", en: "How do I get to Matsudo Station?", id: "Bagaimana cara ke Stasiun Matsudo?" },
    },
  },
  {
    id: "dict-yachin",
    category: "daily",
    japanese: "家賃",
    reading: "やちん (yachin)",
    meaning: { ja: "住まいの賃料", en: "Rent", id: "Sewa rumah" },
    example: {
      ja: "家賃はいつまでに、どのように払えばいいですか？",
      translation: { ja: "家賃の支払い方法を尋ねる", en: "By when and how should I pay the rent?", id: "Sewa dibayar paling lambat kapan, dan bagaimana caranya?" },
    },
  },
  {
    id: "dict-yakkyoku",
    category: "daily",
    japanese: "薬局",
    reading: "やっきょく (yakkyoku)",
    meaning: { ja: "薬を買う店", en: "Pharmacy", id: "Apotek" },
    example: {
      ja: "この近くに薬局はありますか？",
      translation: { ja: "薬局を探す", en: "Is there a pharmacy near here?", id: "Apakah ada apotek di dekat sini?" },
    },
  },

  // -------------------------------------------------------------- emergency
  {
    id: "dict-kyuukyuu",
    category: "emergency",
    japanese: "救急車",
    reading: "きゅうきゅうしゃ (kyūkyūsha)",
    meaning: { ja: "救急車（119番）", en: "Ambulance (dial 119)", id: "Ambulans (telepon 119)" },
    example: {
      ja: "救急車をお願いします。住所は松戸市…です。",
      translation: { ja: "救急車を呼ぶ", en: "Please send an ambulance. The address is Matsudo City...", id: "Tolong kirim ambulans. Alamatnya di Kota Matsudo..." },
    },
  },
  {
    id: "dict-keisatsu",
    category: "emergency",
    japanese: "警察",
    reading: "けいさつ (keisatsu)",
    meaning: { ja: "警察（110番）", en: "Police (dial 110)", id: "Polisi (telepon 110)" },
    example: {
      ja: "警察を呼んでください。事故がありました。",
      translation: { ja: "警察を呼んでもらう", en: "Please call the police. There has been an accident.", id: "Tolong panggil polisi. Ada kecelakaan." },
    },
  },
  {
    id: "dict-kaji",
    category: "emergency",
    japanese: "火事",
    reading: "かじ (kaji)",
    meaning: { ja: "火災（119番）", en: "Fire (dial 119)", id: "Kebakaran (telepon 119)" },
    example: {
      ja: "火事です！場所は松戸市…です。",
      translation: { ja: "火事を通報する", en: "There is a fire! The location is Matsudo City...", id: "Ada kebakaran! Lokasinya di Kota Matsudo..." },
    },
  },
  {
    id: "dict-jishin",
    category: "emergency",
    japanese: "地震",
    reading: "じしん (jishin)",
    meaning: { ja: "地震", en: "Earthquake", id: "Gempa bumi" },
    example: {
      ja: "地震のとき、一番近い避難所はどこですか？",
      translation: { ja: "避難所を尋ねる", en: "Where is the nearest evacuation shelter in case of an earthquake?", id: "Jika terjadi gempa, tempat evakuasi terdekat di mana?" },
    },
  },
  {
    id: "dict-hinanjo",
    category: "emergency",
    japanese: "避難所",
    reading: "ひなんじょ (hinanjo)",
    meaning: { ja: "災害時に避難する場所", en: "Evacuation shelter", id: "Tempat evakuasi" },
    example: {
      ja: "避難所まで案内していただけますか？",
      translation: { ja: "避難所への案内を頼む", en: "Could you guide me to the evacuation shelter?", id: "Bisakah mengantar saya ke tempat evakuasi?" },
    },
  },
  {
    id: "dict-byoin",
    category: "emergency",
    japanese: "病院",
    reading: "びょういん (byōin)",
    meaning: { ja: "医療機関", en: "Hospital", id: "Rumah sakit" },
    example: {
      ja: "英語かインドネシア語が話せるお医者さんはいますか？",
      translation: { ja: "外国語対応の医師を尋ねる", en: "Is there a doctor who speaks English or Indonesian?", id: "Apakah ada dokter yang bisa berbahasa Inggris atau Indonesia?" },
    },
  },
  {
    id: "dict-itai",
    category: "emergency",
    japanese: "痛い",
    reading: "いたい (itai)",
    meaning: { ja: "痛みがある", en: "It hurts / painful", id: "Sakit (nyeri)" },
    example: {
      ja: "お腹がとても痛いです。",
      translation: { ja: "痛みを伝える", en: "My stomach hurts a lot.", id: "Perut saya sangat sakit." },
    },
  },
  {
    id: "dict-arerugi",
    category: "emergency",
    japanese: "アレルギー",
    reading: "あれるぎー (arerugī)",
    meaning: { ja: "アレルギー", en: "Allergy", id: "Alergi" },
    example: {
      ja: "私はアレルギーがあります。この薬に卵や乳は入っていますか？",
      translation: { ja: "アレルギーを伝える", en: "I have allergies. Does this medicine contain egg or milk?", id: "Saya punya alergi. Apakah obat ini mengandung telur atau susu?" },
    },
  },
  {
    id: "dict-tasukete",
    category: "emergency",
    japanese: "助けてください",
    reading: "たすけてください (tasukete kudasai)",
    meaning: { ja: "助けを求める言葉", en: "Please help me", id: "Tolong saya" },
    example: {
      ja: "助けてください！救急車を呼んでください。",
      translation: { ja: "助けを求める", en: "Please help! Call an ambulance.", id: "Tolong! Panggilkan ambulans." },
    },
  },
  {
    id: "dict-michi-mayou",
    category: "emergency",
    japanese: "道に迷いました",
    reading: "みちにまよいました (michi ni mayoimashita)",
    meaning: { ja: "道がわからなくなった", en: "I am lost", id: "Saya tersesat" },
    example: {
      ja: "道に迷いました。この住所まで行きたいのですが。",
      translation: { ja: "道を尋ねる", en: "I am lost. I want to get to this address.", id: "Saya tersesat. Saya ingin ke alamat ini." },
    },
  },

  // ---------------------------------------------------------------- phrases
  {
    id: "dict-sumimasen",
    category: "phrases",
    japanese: "すみません",
    reading: "すみません (sumimasen)",
    meaning: { ja: "呼びかけ・謝罪・感謝", en: "Excuse me / sorry / thank you", id: "Permisi / maaf / terima kasih" },
    example: {
      ja: "すみません、少しお時間をいただけますか？",
      translation: { ja: "声をかける", en: "Excuse me, could I have a moment of your time?", id: "Permisi, boleh minta waktunya sebentar?" },
    },
  },
  {
    id: "dict-onegai",
    category: "phrases",
    japanese: "お願いします",
    reading: "おねがいします (onegaishimasu)",
    meaning: { ja: "依頼の言葉", en: "Please (making a request)", id: "Tolong / mohon" },
    example: {
      ja: "これをお願いします。",
      translation: { ja: "注文・依頼する", en: "This one, please.", id: "Yang ini, tolong." },
    },
  },
  {
    id: "dict-arigatou",
    category: "phrases",
    japanese: "ありがとうございます",
    reading: "ありがとうございます (arigatō gozaimasu)",
    meaning: { ja: "感謝の言葉", en: "Thank you very much", id: "Terima kasih banyak" },
    example: {
      ja: "ご親切にありがとうございます。",
      translation: { ja: "感謝を伝える", en: "Thank you for your kindness.", id: "Terima kasih atas kebaikan Anda." },
    },
  },
  {
    id: "dict-wakarimasen",
    category: "phrases",
    japanese: "日本語がわかりません",
    reading: "にほんごがわかりません (nihongo ga wakarimasen)",
    meaning: { ja: "日本語が理解できない", en: "I do not understand Japanese", id: "Saya tidak mengerti bahasa Jepang" },
    example: {
      ja: "日本語があまりわかりません。ゆっくり話していただけますか？",
      translation: { ja: "ゆっくり話してもらう", en: "I do not understand Japanese well. Could you speak slowly?", id: "Saya kurang paham bahasa Jepang. Bisa bicara pelan-pelan?" },
    },
  },
  {
    id: "dict-eigo",
    category: "phrases",
    japanese: "英語を話せますか",
    reading: "えいごをはなせますか (eigo o hanasemasu ka)",
    meaning: { ja: "英語ができるか尋ねる", en: "Do you speak English?", id: "Apakah Anda bisa berbahasa Inggris?" },
    example: {
      ja: "英語を話せる方はいらっしゃいますか？",
      translation: { ja: "英語が話せる人を探す", en: "Is there anyone who speaks English?", id: "Apakah ada yang bisa berbahasa Inggris?" },
    },
  },
  {
    id: "dict-musurimu",
    category: "phrases",
    japanese: "私はムスリムです",
    reading: "わたしはむすりむです (watashi wa musurimu desu)",
    meaning: { ja: "イスラーム教徒であること", en: "I am a Muslim", id: "Saya seorang muslim" },
    example: {
      ja: "私はムスリムです。豚肉とお酒は口にしません。",
      translation: { ja: "自分の信仰を伝える", en: "I am a Muslim. I do not consume pork or alcohol.", id: "Saya muslim. Saya tidak mengonsumsi babi dan alkohol." },
    },
  },
  {
    id: "dict-yasumi",
    category: "phrases",
    japanese: "休み",
    reading: "やすみ (yasumi)",
    meaning: { ja: "休暇・休憩", en: "Day off / break", id: "Libur / istirahat" },
    example: {
      ja: "礼拝のために、10分ほど休憩をいただいてもよろしいですか？",
      translation: { ja: "礼拝のための休憩を願い出る", en: "May I take a break of about 10 minutes for prayer?", id: "Bolehkah saya istirahat sekitar 10 menit untuk salat?" },
    },
  },
  {
    id: "dict-shashin",
    category: "phrases",
    japanese: "写真を撮ってもいいですか",
    reading: "しゃしんをとってもいいですか (shashin o totte mo ii desu ka)",
    meaning: { ja: "撮影の許可を求める", en: "May I take a photo?", id: "Bolehkah saya memotret?" },
    example: {
      ja: "この表示の写真を撮ってもいいですか？",
      translation: { ja: "表示の撮影許可を求める", en: "May I take a photo of this label?", id: "Bolehkah saya memotret label ini?" },
    },
  },
  {
    id: "dict-jikoshokai",
    category: "phrases",
    japanese: "自己紹介",
    reading: "じこしょうかい (jikoshōkai)",
    meaning: { ja: "自分を紹介する", en: "Self-introduction", id: "Perkenalan diri" },
    example: {
      ja: "はじめまして。インドネシアから来ました。松戸に住んでいます。よろしくお願いします。",
      translation: { ja: "簡単な自己紹介", en: "Nice to meet you. I come from Indonesia and live in Matsudo. Pleased to meet you.", id: "Salam kenal. Saya dari Indonesia dan tinggal di Matsudo. Mohon bantuannya." },
    },
  },
  {
    id: "dict-honyaku",
    category: "phrases",
    japanese: "翻訳アプリ",
    reading: "ほんやくあぷり (hon'yaku apuri)",
    meaning: { ja: "翻訳用のアプリ", en: "Translation app", id: "Aplikasi penerjemah" },
    example: {
      ja: "翻訳アプリを使って話してもいいですか？",
      translation: { ja: "翻訳アプリの使用を断る", en: "May I use a translation app to talk with you?", id: "Bolehkah saya memakai aplikasi penerjemah untuk berbicara?" },
    },
  },
];
