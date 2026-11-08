import type * as React from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Backpack,
  Bike,
  BookOpen,
  Briefcase,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Hospital,
  Landmark,
  Mail,
  Phone,
  Recycle,
  Siren,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/types";
import { getProfile } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NewcomerChecklist, PrintButton } from "@/components/guides";
import { cn } from "@/lib/utils/cn";

type NamedItem = { name: string; detail: string };
type EmergencyNumber = { label: string; number: string; detail: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "newcomers" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const TOC: { key: "firstSteps" | "garbage" | "transport" | "halal" | "emergency" | "work" | "contact"; icon: React.ComponentType }[] = [
  { key: "firstSteps", icon: Landmark },
  { key: "garbage", icon: Recycle },
  { key: "transport", icon: TrainFront },
  { key: "halal", icon: UtensilsCrossed },
  { key: "emergency", icon: Siren },
  { key: "work", icon: Briefcase },
  { key: "contact", icon: WhatsAppIcon },
];

export default async function NewcomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, tc, profile] = await Promise.all([getTranslations({ locale, namespace: "newcomers" }), getTranslations({ locale, namespace: "common" }), getProfile()]);

  const garbageTypes = Object.values(t.raw("garbage.types") as Record<string, NamedItem>);
  const garbageTips = Object.values(t.raw("garbage.tips") as Record<string, string>);
  const transportItems = Object.values(t.raw("transport.items") as Record<string, NamedItem>);
  const supermarkets = Object.values(t.raw("halal.supermarkets") as Record<string, string>);
  const labels = Object.values(t.raw("halal.labels") as Record<string, string>);
  const numbers = Object.values(t.raw("emergency.numbers") as Record<string, EmergencyNumber>);
  const earthquake = Object.values(t.raw("emergency.earthquake") as Record<string, string>);
  const hospitals = Object.values(t.raw("emergency.hospitals") as Record<string, string>);
  const workItems = Object.values(t.raw("work.items") as Record<string, NamedItem>);
  const whatsappUrl = buildWhatsAppUrl(profile.whatsapp, t("contact.whatsappMessage"));

  return (
    <div>
      {/* Hero */}
      <section className="hero-surface">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading as="h1" tone="inverse" tag={t("tag")} tri={{ ja: "新生活", ar: "دليل" }} title={t("title")} highlight={t("highlight")} description={t("description")} />
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <PrintButton label={t("hero.print")} variant="inverse" />
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outlineInverse" })}>
              <WhatsAppIcon />
              {t("hero.whatsapp")}
            </a>
            <Link href="/halal" className={buttonVariants({ variant: "outlineInverse" })}>
              {t("hero.halal")}
            </Link>
            <Link href="/dictionary" className={buttonVariants({ variant: "outlineInverse" })}>
              {t("hero.dictionary")}
            </Link>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-hero-muted">{t("hero.note")}</p>
        </div>
      </section>

      {/* Daftar isi */}
      <nav aria-label={t("toc.title")} className="container-site -mt-8 print:hidden">
        <ul className="card-surface grid grid-cols-2 gap-1 p-2 sm:grid-cols-4 lg:grid-cols-7">
          {TOC.map(({ key, icon: Icon }) => (
            <li key={key}>
              <a href={`#${key}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface">
                <IconCircle size="sm" tone="soft">
                  <Icon />
                </IconCircle>
                <span className="truncate">{t(`toc.${key}`)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 1. Langkah pertama */}
      <section id="firstSteps" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading tag={t("firstSteps.tag")} title={t("firstSteps.title")} description={t("firstSteps.description")} />
        <div className="mt-8">
          <NewcomerChecklist locale={locale} />
        </div>
      </section>

      {/* 2. Sampah */}
      <section id="garbage" className="scroll-mt-24 bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading tag={t("garbage.tag")} title={t("garbage.title")} description={t("garbage.description")} />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="card-surface px-5 sm:px-6">
              {garbageTypes.map((item, i) => (
                <NumberedItem key={item.name} index={i + 1} title={item.name} description={item.detail} icon={<Recycle />} />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <Card>
                <CardTitle>{t("garbage.scheduleTitle")}</CardTitle>
                <CardDescription className="mt-2">{t("garbage.schedule")}</CardDescription>
                <a href={t("garbage.linkUrl")} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>
                  {t("garbage.link")}
                  <ExternalLink />
                </a>
              </Card>
              <Card variant="muted">
                <CardTitle>{t("garbage.tipsTitle")}</CardTitle>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                  {garbageTips.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Transportasi */}
      <section id="transport" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading tag={t("transport.tag")} title={t("transport.title")} description={t("transport.description")} />
        <Accordion type="multiple" className="mt-8 flex flex-col gap-3">
          {transportItems.map((item, i) => (
            <AccordionItem key={item.name} value={`transport-${i}`}>
              <AccordionTrigger>
                <span className="flex items-center gap-3">
                  <IconCircle size="sm" tone="soft">
                    {i === 4 ? <Bike /> : i === 2 ? <CreditCard /> : <TrainFront />}
                  </IconCircle>
                  {item.name}
                </span>
              </AccordionTrigger>
              <AccordionContent>{item.detail}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* 4. Halal */}
      <section id="halal" className="scroll-mt-24 bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading
            tag={t("halal.tag")}
            title={t("halal.title")}
            description={t("halal.description")}
            action={
              <Link href="/halal" className={buttonVariants()}>
                <UtensilsCrossed />
                {t("halal.link")}
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardTitle>{t("halal.supermarketsTitle")}</CardTitle>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {supermarkets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <CardTitle>{t("halal.labelsTitle")}</CardTitle>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                {labels.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Darurat */}
      <section id="emergency" className="container-site scroll-mt-24 py-12 lg:py-16">
        <SectionHeading tag={t("emergency.tag")} title={t("emergency.title")} description={t("emergency.description")} />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {numbers.map((n) => (
            <Card key={n.number} variant="dark" className="flex flex-col">
              <div className="flex items-center gap-3">
                <IconCircle tone="inverse" size="sm">
                  <Siren />
                </IconCircle>
                <p className="font-semibold">{n.label}</p>
              </div>
              <p className="headline mt-4 text-5xl tabular">{n.number}</p>
              <p className="mt-3 flex-1 text-sm text-hero-muted">{n.detail}</p>
              <a href={`tel:${n.number}`} className={cn(buttonVariants({ variant: "inverse" }), "mt-5 print:hidden")}>
                <Phone />
                {t("emergency.call", { number: n.number })}
              </a>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" size="sm">
                <Backpack />
              </IconCircle>
              <CardTitle>{t("emergency.earthquakeTitle")}</CardTitle>
            </div>
            <ol className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {earthquake.map((item, i) => (
                <li key={item} className="flex gap-3">
                  <span className="text-brand text-xs font-bold tabular">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" size="sm">
                <Landmark />
              </IconCircle>
              <CardTitle>{t("emergency.consulateTitle")}</CardTitle>
            </div>
            <CardDescription className="mt-4">{t("emergency.consulate")}</CardDescription>
            <a href={`tel:${t("emergency.consulatePhone")}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 print:hidden")}>
              <Phone />
              {t("emergency.consulatePhone")}
            </a>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <IconCircle tone="soft" size="sm">
                <Hospital />
              </IconCircle>
              <CardTitle>{t("emergency.hospitalsTitle")}</CardTitle>
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {hospitals.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* 6. Kerja & sekolah */}
      <section id="work" className="scroll-mt-24 bg-surface/60 py-12 lg:py-16">
        <div className="container-site">
          <SectionHeading tag={t("work.tag")} title={t("work.title")} description={t("work.description")} />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="card-surface px-5 sm:px-6">
              {workItems.map((item, i) => (
                <NumberedItem key={item.name} index={i + 1} title={item.name} description={item.detail} icon={i === 3 ? <GraduationCap /> : <Briefcase />} />
              ))}
            </div>
            <Card variant="muted" className="flex flex-col">
              <CardTitle>{t("work.letterTitle")}</CardTitle>
              <p lang="ja" className="mt-4 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                {t("work.letterJa")}
              </p>
              <CardDescription className="mt-3">{t("work.letter")}</CardDescription>
              <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                <CopyButton value={t("work.letterJa")} label={t("work.copyLetter")} />
                <Link href="/dictionary" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  <BookOpen />
                  {t("work.dictionaryLink")}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. Kontak */}
      <section id="contact" className="container-site scroll-mt-24 py-12 lg:py-16">
        <Card variant="dark" className="p-8 sm:p-10">
          <SectionHeading tone="inverse" tag={t("contact.tag")} title={t("contact.title")} description={t("contact.description")} />
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "inverse" })}>
              <WhatsAppIcon />
              {t("contact.whatsapp")}
            </a>
            <a href={`mailto:${profile.email}`} className={buttonVariants({ variant: "outlineInverse" })}>
              <Mail />
              {t("contact.email")}
            </a>
            <a href={`tel:${profile.phone}`} className={buttonVariants({ variant: "outlineInverse" })}>
              <Phone />
              {t("contact.phone")}
            </a>
            <PrintButton label={t("contact.print")} variant="outlineInverse" />
          </div>
          <div className="mt-6 text-sm text-hero-muted">
            <p>
              {tc("labels.location")}: {profile.address[locale]} {profile.postalCode}
            </p>
            <p className="mt-1">
              {tc("actions.email")}: {profile.email} · {tc("actions.call")}: {profile.phone}
            </p>
            <p className="mt-3 print:hidden">{t("contact.printHint")}</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
