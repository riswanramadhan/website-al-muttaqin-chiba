/** Tautan WhatsApp dengan pesan terisi; dipakai sebagai jalur fallback formulir (PRD-05, PRD-08). */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Susun pesan multi-baris dari pasangan label/nilai, melewati nilai kosong. */
export function composeMessage(title: string, fields: [string, string | number | undefined | null][]): string {
  const lines = [title, ""];
  for (const [label, value] of fields) {
    if (value === undefined || value === null || value === "") continue;
    lines.push(`${label}: ${value}`);
  }
  return lines.join("\n");
}
