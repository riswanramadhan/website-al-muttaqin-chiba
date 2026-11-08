import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, DoorOpen, HeartHandshake } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { ProgramGrid } from "@/components/programs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "programs" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const STEP_KEYS = ["1", "2", "3", "4"] as const;

export default async function ProgramsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "programs" }), getProfile()]);

  return (
    <>
      <section className="hero-surface pattern-star">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading
            as="h1"
            tone="inverse"
            tag={t("tag")}
            tri={{ ja: "プログラム", ar: "برامج" }}
            title={t("title")}
            highlight={t("highlight")}
            description={t("description")}
          />
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <ProgramGrid locale={locale} />
      </section>

      <section className="bg-surface/60">
        <div className="container-site grid grid-cols-1 gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" shape="square">
                <HeartHandshake />
              </IconCircle>
              <SectionHeading as="h2" tag={t("muallaf.tag")} title={t("muallaf.title")} highlight={t("muallaf.highlight")} />
            </div>
            <p className="mt-4 text-muted-foreground">{t("muallaf.description")}</p>
            <div className="card-surface mt-6 px-6">
              {STEP_KEYS.map((k, i) => (
                <NumberedItem key={k} index={i + 1} title={t(`muallaf.steps.${k}.title`)} description={t(`muallaf.steps.${k}.text`)} />
              ))}
            </div>
            <Link href="/programs/kelas-muallaf" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
              {t("muallaf.cta")}
              <ArrowRight />
            </Link>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" shape="square">
                <DoorOpen />
              </IconCircle>
              <SectionHeading as="h2" tag={t("visits.tag")} title={t("visits.title")} highlight={t("visits.highlight")} />
            </div>
            <p className="mt-4 text-muted-foreground">{t("visits.description")}</p>
            <div className="card-surface mt-6 px-6">
              {STEP_KEYS.map((k, i) => (
                <NumberedItem key={k} index={i + 1} title={t(`visits.steps.${k}.title`)} description={t(`visits.steps.${k}.text`)} />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/programs/open-mosque" className={buttonVariants({ variant: "outline" })}>
                {t("visits.ctaOpen")}
              </Link>
              <Link href="/programs/kunjungan-sekolah" className={buttonVariants({ variant: "outline" })}>
                {t("visits.ctaSchool")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <div className="card-surface flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("cta.title")}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("cta.body")}</p>
          </div>
          <a href={buildWhatsAppUrl(profile.whatsapp, t("whatsapp.greeting"))} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
            {t("cta.button")}
          </a>
        </div>
      </section>
    </>
  );
}
