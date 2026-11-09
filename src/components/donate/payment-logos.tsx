import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

/**
 * Logo resmi aplikasi yang bisa memindai QRIS (berkas lokal di public/images/payments,
 * sumber dan catatan merek dagang di CREDITS.md). Logo ditaruh di atas "chip" putih agar
 * warna mereknya tetap terbaca di mode gelap. Lebar/tinggi = rasio asli tiap SVG.
 */
type PaymentLogo = { id: string; name: string; src: string; width: number; height: number };

const QRIS: PaymentLogo = { id: "qris", name: "QRIS", src: "/images/payments/qris.svg", width: 163, height: 62 };

export const EWALLET_LOGOS: PaymentLogo[] = [
  { id: "gopay", name: "GoPay", src: "/images/payments/gopay.svg", width: 2582, height: 602 },
  { id: "ovo", name: "OVO", src: "/images/payments/ovo.svg", width: 77, height: 24 },
  { id: "dana", name: "DANA", src: "/images/payments/dana.svg", width: 382, height: 109 },
  { id: "shopeepay", name: "ShopeePay", src: "/images/payments/shopeepay.svg", width: 188, height: 36 },
];

export const BANK_LOGOS: PaymentLogo[] = [
  { id: "bsi", name: "Bank Syariah Indonesia (BSI)", src: "/images/payments/bsi.svg", width: 512, height: 142 },
  { id: "bca", name: "BCA", src: "/images/payments/bca.svg", width: 1000, height: 313 },
  { id: "mandiri", name: "Bank Mandiri", src: "/images/payments/mandiri.svg", width: 60, height: 18 },
  { id: "bri", name: "BRI", src: "/images/payments/bri.svg", width: 512, height: 192 },
  { id: "bni", name: "BNI", src: "/images/payments/bni.svg", width: 200, height: 58 },
];

function LogoChip({ logo, alt, large = false }: { logo: PaymentLogo; alt: string; large?: boolean }) {
  return (
    <li className={cn("flex items-center justify-center rounded-lg bg-white px-3 ring-1 ring-border", large ? "h-11" : "h-10")}>
      <Image
        src={logo.src}
        alt={alt}
        width={logo.width}
        height={logo.height}
        unoptimized
        loading="lazy"
        className={cn("w-auto max-w-full object-contain", large ? "h-7" : "h-5 sm:h-6")}
      />
    </li>
  );
}

function LogoGroup({ label, logos, alt }: { label: string; logos: PaymentLogo[]; alt: (name: string) => string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
        {logos.map((logo) => (
          <LogoChip key={logo.id} logo={logo} alt={alt(logo.name)} />
        ))}
      </ul>
    </div>
  );
}

/** Daftar logo e-wallet dan m-banking untuk rekening QRIS. Aman dipakai di server maupun client. */
export function PaymentLogos({ className }: { className?: string }) {
  const t = useTranslations("donate.accounts.logos");
  const alt = (name: string) => t("alt", { name });
  return (
    <section className={cn("flex flex-col gap-4 rounded-xl bg-surface p-4", className)} aria-label={t("title")}>
      <div className="flex items-center gap-3">
        <ul className="shrink-0">
          <LogoChip logo={QRIS} alt={alt(QRIS.name)} large />
        </ul>
        <p className="text-sm font-semibold leading-snug">{t("title")}</p>
      </div>
      <LogoGroup label={t("ewallet")} logos={EWALLET_LOGOS} alt={alt} />
      <LogoGroup label={t("banks")} logos={BANK_LOGOS} alt={alt} />
      <p className="text-xs leading-relaxed text-muted-foreground">{t("more")}</p>
    </section>
  );
}
