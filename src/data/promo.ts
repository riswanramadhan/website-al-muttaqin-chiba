import type { PromoPopup } from "@/lib/types";

/** Pop-up poster donasi bawaan; admin dapat mengganti gambar atau mematikannya dari panel. */
export const promoPopup: PromoPopup = {
  enabled: true,
  image: { src: "/images/promo/poster-donasi.jpg", width: 1080, height: 1350 },
  alt: {
    ja: "アルムッタキーン文化センターへのご寄付のお願い",
    en: "Donation appeal poster for Al Muttaqin Cultural Center",
    id: "Poster ajakan donasi Al Muttaqin Cultural Center",
  },
  href: "/donate",
  version: "v1",
};
