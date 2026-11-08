import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpenText, Camera, CircleQuestionMark, DoorOpen, Footprints, Hand, HeartHandshake, Mail, Shirt, UsersRound, type LucideIcon } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { formatNumber } from "@/lib/utils/i18n";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionTag } from "@/components/ui/section-tag";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "islam" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const FAITH_KEYS = ["1", "2", "3", "4", "5", "6"] as const;
const ISLAM_KEYS = ["1", "2", "3", "4", "5"] as const;
const STAT_KEYS = ["1", "2", "3"] as const;
const MOSQUE_KEYS = ["1", "2", "3", "4"] as const;
const ETIQUETTE: { key: "1" | "2" | "3" | "4" | "5"; icon: LucideIcon }[] = [
  { key: "1", icon: Shirt },
  { key: "2", icon: Footprints },
  { key: "3", icon: Camera },
  { key: "4", icon: UsersRound },
  { key: "5", icon: Hand },
];
const MYTH_KEYS = ["1", "2", "3", "4", "5"] as const;
const LEARN: { key: "1" | "2" | "3" | "4"; icon: LucideIcon; href?: string }[] = [
  { key: "1", icon: HeartHandshake, href: "/programs/kelas-muallaf" },
  { key: "2", icon: DoorOpen, href: "/programs/open-mosque" },
  { key: "3", icon: BookOpenText },
  { key: "4", icon: CircleQuestionMark, href: "/faq" },
];

export default async function IslamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "islam" }), getProfile()]);
  const stats = STAT_KEYS.map((k) => ({ key: k, value: Number(t(`japan.stats.${k}.value`)), suffix: t(`japan.stats.${k}.suffix`), label: t(`japan.stats.${k}.label`) }));

  return (
    <>
      <section className="hero-surface pattern-star">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading
            as="h1"
            tone="inverse"
            tag={t("tag")}
            tri={{ ja: "イスラームを知る", ar: "تعرف على الإسلام" }}
            title={t("title")}
            highlight={t("highlight")}
            description={t("description")}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/programs/open-mosque" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              {t("hero.visit")}
              <ArrowRight />
            </Link>
            <a href="#contact" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
              {t("hero.ask")}
            </a>
          </div>
        </div>
      </section>

      {/* Apa itu Islam */}
      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <SectionHeading tag={t("intro.tag")} title={t("intro.title")} highlight={t("intro.highlight")} />
          <div className="space-y-4 text-lg leading-relaxed">
            <p>{t("intro.p1")}</p>
            <p className="text-muted-foreground">{t("intro.p2")}</p>
            <Card variant="muted" className="p-5">
              <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose">
                {t("intro.arabic")}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t("intro.arabicMeaning")}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Rukun iman & rukun Islam */}
      <section className="bg-surface/60">
        <div className="container-site py-12 lg:py-16">
          <SectionHeading tag={t("pillars.tag")} title={t("pillars.title")} highlight={t("pillars.highlight")} description={t("pillars.description")} />
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="px-6 py-2">
              <h3 className="pt-4 text-lg font-bold">{t("pillars.faithTitle")}</h3>
              {FAITH_KEYS.map((k, i) => (
                <NumberedItem key={k} index={i + 1} title={t(`pillars.faith.${k}.title`)} description={t(`pillars.faith.${k}.text`)} />
              ))}
            </Card>
            <Card className="px-6 py-2">
              <h3 className="pt-4 text-lg font-bold">{t("pillars.islamTitle")}</h3>
              {ISLAM_KEYS.map((k, i) => (
                <NumberedItem key={k} index={i + 1} title={t(`pillars.islam.${k}.title`)} description={t(`pillars.islam.${k}.text`)} />
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* Muslim di Jepang */}
      <section className="container-site py-12 lg:py-16">
        <SectionHeading tag={t("japan.tag")} title={t("japan.title")} highlight={t("japan.highlight")} description={t("japan.description")} />
        <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Card key={s.key} variant="dark" className="p-6">
              <dd className="text-4xl font-bold tabular">
                {Number.isFinite(s.value) ? formatNumber(s.value, locale) : t(`japan.stats.${s.key}.value`)}
                <span className="text-xl">{s.suffix}</span>
              </dd>
              <dt className="mt-2 text-sm text-hero-muted">{s.label}</dt>
            </Card>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">{t("japan.note")}</p>
      </section>

      {/* Di masjid & adab berkunjung */}
      <section className="bg-surface/60">
        <div className="container-site grid grid-cols-1 gap-10 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
          <div>
            <SectionHeading tag={t("mosque.tag")} title={t("mosque.title")} highlight={t("mosque.highlight")} description={t("mosque.description")} />
            <div className="card-surface mt-6 px-6">
              {MOSQUE_KEYS.map((k, i) => (
                <NumberedItem key={k} index={i + 1} title={t(`mosque.items.${k}.title`)} description={t(`mosque.items.${k}.text`)} />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading tag={t("etiquette.tag")} title={t("etiquette.title")} highlight={t("etiquette.highlight")} description={t("etiquette.description")} />
            <ul className="mt-6 space-y-3">
              {ETIQUETTE.map(({ key, icon: Icon }) => (
                <li key={key} className="card-surface flex items-start gap-4 p-5">
                  <IconCircle size="sm" tone="soft">
                    <Icon />
                  </IconCircle>
                  <div>
                    <p className="font-bold">{t(`etiquette.items.${key}.title`)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`etiquette.items.${key}.text`)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Salah paham umum */}
      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <SectionHeading tag={t("myths.tag")} title={t("myths.title")} highlight={t("myths.highlight")} description={t("myths.description")} />
          <Accordion type="single" collapsible className="space-y-3">
            {MYTH_KEYS.map((k) => (
              <AccordionItem key={k} value={k}>
                <AccordionTrigger>{t(`myths.items.${k}.q`)}</AccordionTrigger>
                <AccordionContent>{t(`myths.items.${k}.a`)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Belajar lebih lanjut */}
      <section className="bg-surface/60">
        <div className="container-site py-12 lg:py-16">
          <SectionHeading tag={t("learn.tag")} title={t("learn.title")} highlight={t("learn.highlight")} description={t("learn.description")} />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LEARN.map(({ key, icon: Icon, href }) => {
              const body = (
                <>
                  <IconCircle tone="soft" shape="square">
                    <Icon />
                  </IconCircle>
                  <div className="flex-1">
                    <p className="font-bold">{t(`learn.items.${key}.title`)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t(`learn.items.${key}.text`)}</p>
                  </div>
                  {href && (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                      {t("learn.open")}
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  )}
                </>
              );
              return href ? (
                <Link key={key} href={href} className="card-surface lift flex h-full flex-col gap-4 p-6">
                  {body}
                </Link>
              ) : (
                <div key={key} className="card-surface flex h-full flex-col gap-4 p-6">
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kontak pembimbing & ajakan kunjungan */}
      <section id="contact" className="container-site py-12 lg:py-16">
        <Card variant="dark" className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-12">
          <div>
            <SectionTag tone="inverse">{t("contact.tag")}</SectionTag>
            <h2 className="headline mt-4 text-3xl sm:text-4xl">{t("contact.title")}</h2>
            <p className="mt-4 text-hero-muted">{t("contact.body")}</p>
            <p className="mt-3 text-sm text-hero-muted">{t("contact.mentor")}</p>
          </div>
          <div className="flex flex-col gap-3 lg:justify-center">
            <a href={buildWhatsAppUrl(profile.whatsapp, t("contact.whatsappText"))} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              <WhatsAppIcon />
              {t("contact.whatsapp")}
            </a>
            <a href={`mailto:${profile.email}`} className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
              <Mail />
              {t("contact.email")}
            </a>
            <Link href="/programs/open-mosque" className={buttonVariants({ variant: "outlineInverse", size: "lg" })}>
              <DoorOpen />
              {t("contact.visit")}
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}
