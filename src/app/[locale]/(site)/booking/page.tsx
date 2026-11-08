import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, CircleCheck, Clock, Landmark, UsersRound } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getRooms } from "@/lib/data";
import { pick, tokyoDateKey } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionTag } from "@/components/ui/section-tag";
import { IconCircle, NumberedItem } from "@/components/ui/primitives";
import { BookingForm, type BookingRoomOption } from "@/components/programs";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return { title: t("meta.title"), description: t("meta.description") };
}

const RULE_KEYS = ["1", "2", "3", "4", "5"] as const;

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, rooms] = await Promise.all([getTranslations({ locale, namespace: "booking" }), getRooms()]);
  const roomOptions: BookingRoomOption[] = rooms.map((r) => ({ id: r.id, name: pick(r.name, locale), capacity: r.capacity }));

  return (
    <>
      <section className="hero-surface pattern-shippo">
        <div className="container-site py-16 lg:py-24">
          <SectionHeading
            as="h1"
            tone="inverse"
            tag={t("tag")}
            tri={{ ja: "施設利用", ar: "حجز القاعة" }}
            title={t("title")}
            highlight={t("highlight")}
            description={t("description")}
          />
        </div>
      </section>

      <section className="container-site py-12 lg:py-16">
        <SectionHeading tag={t("rooms.tag")} title={t("rooms.title")} highlight={t("rooms.highlight")} description={t("rooms.description")} />
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="flex h-full flex-col gap-5">
              <div className="flex items-start justify-between gap-3">
                <IconCircle tone="soft" shape="square">
                  <Landmark />
                </IconCircle>
                <Badge variant="soft">
                  <UsersRound />
                  {t("rooms.capacity", { count: room.capacity })}
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-bold">{pick(room.name, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pick(room.description, locale)}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("rooms.amenities")}</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {room.amenities.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                        {pick(a, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("rooms.availableFor")}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {room.availableFor.map((a, i) => (
                      <li key={i}>
                        <Badge variant="outline">{pick(a, locale)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface/60">
        <div className="container-site grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1fr_1.4fr] lg:gap-14 lg:py-16">
          <div className="space-y-6">
            <div>
              <SectionTag>{t("rules.tag")}</SectionTag>
              <h2 className="mt-3 text-2xl font-bold">
                {t("rules.title")} <span className="text-brand">{t("rules.highlight")}</span>
              </h2>
              <div className="card-surface mt-4 px-6">
                {RULE_KEYS.map((k, i) => (
                  <NumberedItem key={k} index={i + 1} title={t(`rules.items.${k}.title`)} description={t(`rules.items.${k}.text`)} />
                ))}
              </div>
            </div>

            <Card variant="dark" className="flex items-start gap-4">
              <IconCircle tone="inverse">
                <CalendarDays />
              </IconCircle>
              <div>
                <p className="font-bold">{t("availability.title")}</p>
                <p className="mt-1 text-sm text-hero-muted">{t("availability.body")}</p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
                  <Clock className="size-4" aria-hidden />
                  {t("availability.hours")}
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-6 sm:p-8" id="form">
            <SectionTag tone="brand">{t("form.tag")}</SectionTag>
            <h2 className="mt-3 text-2xl font-bold">{t("form.title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("form.description")}</p>
            <div className="mt-6">
              <BookingForm locale={locale} rooms={roomOptions} todayKey={tokyoDateKey()} />
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
