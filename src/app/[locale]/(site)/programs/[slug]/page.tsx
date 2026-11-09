import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, CalendarDays, Languages, UserRound, UsersRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { Locale, Program } from "@/lib/types";
import { getFaqs, getProgramBySlug, getPrograms } from "@/lib/data";
import { pick, pickBlocks } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RichText } from "@/components/ui/rich-text";
import { SectionTag } from "@/components/ui/section-tag";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProgramIcon, ProgramRegistrationForm } from "@/components/programs";

type Params = { locale: string; slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const programs = await getPrograms();
  return routing.locales.flatMap((locale) => programs.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return {};
  const t = await getTranslations({ locale, namespace: "programs" });
  return {
    title: t("detail.metaTitle", { program: pick(program.title, locale as Locale) }),
    description: pick(program.excerpt, locale as Locale),
  };
}

const STEP_KEYS = ["1", "2", "3", "4"] as const;
const REQ_KEYS = ["1", "2", "3"] as const;
const FAQ_KEYS = ["1", "2", "3"] as const;

/** Bagian khusus per program (PRD-08b): kelas muallaf, open mosque & kunjungan sekolah. */
function specialSectionKey(id: Program["id"]): "muallaf" | "visits" | null {
  if (id === "muallaf-class") return "muallaf";
  if (id === "open-mosque" || id === "school-visit") return "visits";
  return null;
}

export default async function ProgramDetailPage({ params }: { params: Promise<Params> }) {
  const { locale: raw, slug } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const [t, tc, faqs] = await Promise.all([
    getTranslations({ locale, namespace: "programs" }),
    getTranslations({ locale, namespace: "common" }),
    getFaqs("program"),
  ]);
  const title = pick(program.title, locale);
  const special = specialSectionKey(program.id);

  return (
    <>
      <section className="hero-surface pattern-shippo">
        <div className="container-site py-14 lg:py-20">
          <Link href="/programs" className="tap-link inline-flex items-center gap-2 text-sm font-semibold text-hero-muted hover:text-hero-foreground">
            <ArrowLeft className="size-4" aria-hidden />
            {t("detail.backToList")}
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
            <IconCircle size="lg" tone="inverse" shape="square">
              <ProgramIcon icon={program.icon} />
            </IconCircle>
            <div className="max-w-3xl">
              <SectionTag tone="inverse">{t("tag")}</SectionTag>
              <h1 className="headline mt-4 text-4xl text-hero-foreground sm:text-5xl">{title}</h1>
              <p className="mt-4 text-lg text-hero-muted">{pick(program.excerpt, locale)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant={program.registrationOpen ? "success" : "inverse"}>{program.registrationOpen ? t("card.open") : t("card.closed")}</Badge>
                {program.languages.map((lang) => (
                  <Badge key={lang} variant="inverse">
                    {t(`lang.${lang}`)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
          <div className="min-w-0 space-y-10">
            <div>
              <h2 className="text-2xl font-bold">{t("detail.about")}</h2>
              <RichText blocks={pickBlocks(program.description, locale)} className="mt-4" />
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card variant="muted" className="flex items-start gap-4 p-5">
                <IconCircle size="sm" tone="soft">
                  <CalendarDays />
                </IconCircle>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.schedule")}</dt>
                  <dd className="mt-1 font-semibold">{pick(program.schedule, locale)}</dd>
                </div>
              </Card>
              <Card variant="muted" className="flex items-start gap-4 p-5">
                <IconCircle size="sm" tone="soft">
                  <UsersRound />
                </IconCircle>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.audience")}</dt>
                  <dd className="mt-1 font-semibold">{pick(program.audience, locale)}</dd>
                </div>
              </Card>
              <Card variant="muted" className="flex items-start gap-4 p-5">
                <IconCircle size="sm" tone="soft">
                  <Languages />
                </IconCircle>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.languages")}</dt>
                  <dd className="mt-1 font-semibold">{program.languages.map((l) => t(`lang.${l}`)).join(" · ")}</dd>
                </div>
              </Card>
              <Card variant="muted" className="flex items-start gap-4 p-5">
                <IconCircle size="sm" tone="soft">
                  <UserRound />
                </IconCircle>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("detail.contact")}</dt>
                  <dd className="mt-1 font-semibold">{program.contactPerson ?? t("detail.contactDefault")}</dd>
                </div>
              </Card>
            </dl>

            <div>
              <h2 className="text-2xl font-bold">{t("detail.requirements")}</h2>
              <div className="card-surface mt-4 px-6">
                {REQ_KEYS.map((k, i) => (
                  <NumberedItem key={k} index={i + 1} title={t(`requirements.${program.id}.${k}.title`)} description={t(`requirements.${program.id}.${k}.text`)} />
                ))}
              </div>
            </div>

            {special && (
              <div>
                <SectionTag>{t(`${special}.tag`)}</SectionTag>
                <h2 className="mt-3 text-2xl font-bold">
                  {t(`${special}.title`)} <span className="text-brand">{t(`${special}.highlight`)}</span>
                </h2>
                <p className="mt-2 text-muted-foreground">{t(`${special}.description`)}</p>
                <div className="card-surface mt-4 px-6">
                  {STEP_KEYS.map((k, i) => (
                    <NumberedItem key={k} index={i + 1} title={t(`${special}.steps.${k}.title`)} description={t(`${special}.steps.${k}.text`)} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold">{t("detail.faqTitle")}</h2>
              <Accordion type="single" collapsible className="mt-4 space-y-3">
                {faqs.map((f) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger>{pick(f.question, locale)}</AccordionTrigger>
                    <AccordionContent>{pick(f.answer, locale)}</AccordionContent>
                  </AccordionItem>
                ))}
                {FAQ_KEYS.map((k) => (
                  <AccordionItem key={k} value={`general-${k}`}>
                    <AccordionTrigger>{t(`faq.${k}.q`)}</AccordionTrigger>
                    <AccordionContent>{t(`faq.${k}.a`)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-6 sm:p-8">
              <SectionTag tone="brand">{program.registrationOpen ? t("detail.registerTag") : t("detail.infoTag")}</SectionTag>
              <h2 className="mt-3 text-xl font-bold">{program.registrationOpen ? t("detail.registerTitle") : t("detail.closedTitle")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{program.registrationOpen ? t("detail.registerDescription") : t("detail.closedDescription")}</p>
              <div className="mt-6">
                {program.registrationOpen ? (
                  <ProgramRegistrationForm locale={locale} programId={program.id} programTitle={title} />
                ) : (
                  <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
                    {tc("actions.contactUs")}
                  </Link>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
