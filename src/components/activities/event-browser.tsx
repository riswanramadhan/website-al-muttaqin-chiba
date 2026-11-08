"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EventCategory, Locale, MosqueEvent } from "@/lib/types";
import { Field, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/activities/event-card";

const CATEGORY_ORDER: EventCategory[] = ["kajian", "tpa", "muallaf", "class", "open-mosque", "community", "culture", "ramadan", "eid"];

/** Tab Mendatang / Sudah lewat dengan filter kategori; daftar sudah dipisah oleh server. */
export function EventBrowser({ upcoming, past, locale, initialTab = "upcoming" }: { upcoming: MosqueEvent[]; past: MosqueEvent[]; locale: Locale; initialTab?: "upcoming" | "past" }) {
  const t = useTranslations("events");
  const tc = useTranslations("common");
  const [category, setCategory] = React.useState<"all" | EventCategory>("all");

  const categories = React.useMemo(() => {
    const present = new Set<EventCategory>([...upcoming, ...past].map((e) => e.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [upcoming, past]);

  const filter = (list: MosqueEvent[]) => (category === "all" ? list : list.filter((e) => e.category === category));
  const shownUpcoming = filter(upcoming);
  const shownPast = filter(past);

  return (
    <Tabs defaultValue={initialTab}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <TabsList aria-label={t("tag")}>
          <TabsTrigger value="upcoming">
            {t("tabs.upcoming")}
            <span className="rounded-full bg-accent px-1.5 text-[0.65rem] text-accent-foreground tabular">{shownUpcoming.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past">
            {t("tabs.past")}
            <span className="rounded-full bg-accent px-1.5 text-[0.65rem] text-accent-foreground tabular">{shownPast.length}</span>
          </TabsTrigger>
        </TabsList>
        <Field label={t("filters.category")} htmlFor="event-category" className="sm:w-60">
          <Select id="event-category" value={category} onChange={(e) => setCategory(e.target.value as "all" | EventCategory)}>
            <option value="all">{t("filters.all")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {tc(`categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <TabsContent value="upcoming">
        {shownUpcoming.length === 0 ? (
          <EmptyState icon={<CalendarDays />} title={t("filters.emptyUpcoming")} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shownUpcoming.map((e) => (
              <li key={e.id}>
                <EventCard event={e} locale={locale} past={false} />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
      <TabsContent value="past">
        {shownPast.length === 0 ? (
          <EmptyState icon={<CalendarDays />} title={t("filters.emptyPast")} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {shownPast.map((e) => (
              <li key={e.id}>
                <EventCard event={e} locale={locale} past />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  );
}
