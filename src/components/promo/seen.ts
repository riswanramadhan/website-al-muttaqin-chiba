/**
 * Penanda "poster promo sudah dilihat" di localStorage. Dipisah dari komponen pop-up agar pemuat
 * malasnya bisa memeriksa penanda tanpa ikut mengunduh pustaka animasi dan dialog.
 */

/** Awalan kunci localStorage; versi poster (diatur admin) ditambahkan di belakangnya. */
const PROMO_SEEN_PREFIX = "acc-promo-poster-donasi-";

export function promoSeenKey(version: string): string {
  return `${PROMO_SEEN_PREFIX}${version}`;
}

export function readPromoSeen(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function markPromoSeen(key: string): void {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // mode privat / penyimpanan diblokir: poster bisa tampil lagi, tidak masalah.
  }
}
