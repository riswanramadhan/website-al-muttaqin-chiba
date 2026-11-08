import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import type { ContentBlock, Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { formatDate, pick } from "@/lib/utils/i18n";
import { SectionHeading } from "@/components/ui/section-heading";
import { RichText } from "@/components/ui/rich-text";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("meta.title"), description: t("meta.description") };
}

/** Urutan bagian kebijakan (APPI Jepang, PRD-03a). Isi tiap bagian ada di pesan `privacy.sections.*`. */
const SECTIONS = ["operator", "collected", "purpose", "legalBasis", "storage", "thirdParties", "sharing", "cookies", "rights", "security", "children", "changes", "contact"] as const;

/** Tanggal berlaku kebijakan (ISO, Asia/Tokyo). */
const EFFECTIVE_DATE = "2026-11-01";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "privacy" }), getProfile()]);

  const values = { name: pick(profile.legalName, locale), email: profile.email, address: pick(profile.address, locale), postalCode: profile.postalCode };

  const blocks: ContentBlock[] = [];
  blocks.push({ type: "p", text: t("intro", values) });
  for (const key of SECTIONS) {
    blocks.push({ type: "h2", text: t(`sections.${key}.title`) });
    blocks.push({ type: "p", text: t(`sections.${key}.body`, values) });
    if (t.has(`sections.${key}.items`)) {
      const raw = t.raw(`sections.${key}.items`) as Record<string, string>;
      const items = Object.keys(raw)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => t(`sections.${key}.items.${k}`, values));
      blocks.push({ type: "ul", items });
    }
    if (t.has(`sections.${key}.note`)) {
      blocks.push({ type: "callout", tone: "info", text: t(`sections.${key}.note`, values) });
    }
  }

  return (
    <div className="container-site py-12 lg:py-16">
      <SectionHeading as="h1" tag={t("hero.tag")} tri={{ ja: "プライバシーポリシー", ar: "سياسة الخصوصية" }} title={t("hero.title")} highlight={t("hero.highlight")} description={t("hero.description")} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <article className="container-narrow lg:col-span-8 lg:mx-0 lg:max-w-none">
          <p className="text-sm text-muted-foreground tabular">{t("effective", { date: formatDate(EFFECTIVE_DATE, locale) })}</p>
          <RichText blocks={blocks} className="mt-6" />
        </article>
        <aside className="lg:col-span-4">
          <div className="card-muted sticky top-24 p-6">
            <h2 className="text-lg font-bold">{t("aside.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("aside.body")}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("aside.operator")}</dt>
                <dd className="mt-0.5">{values.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("aside.address")}</dt>
                <dd className="mt-0.5">
                  {locale === "ja" ? `〒${profile.postalCode} ` : ""}
                  {values.address}
                </dd>
              </div>
            </dl>
            <a href={`mailto:${profile.email}?subject=${encodeURIComponent(t("aside.mailSubject"))}`} className={buttonVariants({ variant: "primary", size: "sm", className: "mt-5" })}>
              <Mail />
              {t("aside.cta")}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
