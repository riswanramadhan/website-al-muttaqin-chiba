import { getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays, UsersRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale, Program } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { Badge } from "@/components/ui/badge";
import { IconCircle } from "@/components/ui/primitives";
import { ProgramIcon } from "@/components/programs/program-icon";

/** Kartu program: ikon, judul, ringkasan, jadwal, audiens, badge bahasa, status pendaftaran. */
export async function ProgramCard({ program, locale }: { program: Program; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "programs" });
  const href = `/programs/${program.slug}`;

  return (
    <article className="card-surface lift flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <IconCircle tone="soft" shape="square">
          <ProgramIcon icon={program.icon} />
        </IconCircle>
        <Badge variant={program.registrationOpen ? "success" : "outline"}>
          {program.registrationOpen ? t("card.open") : t("card.closed")}
        </Badge>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold leading-snug">
          <Link href={href} className="tap-link hover:text-brand">
            {pick(program.title, locale)}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pick(program.excerpt, locale)}</p>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <dt className="sr-only">{t("card.schedule")}</dt>
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <dd>{pick(program.schedule, locale)}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="sr-only">{t("card.audience")}</dt>
          <UsersRound className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <dd className="text-muted-foreground">{pick(program.audience, locale)}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <ul className="flex flex-wrap gap-1.5" aria-label={t("card.languages")}>
          {program.languages.map((lang) => (
            <li key={lang}>
              <Badge variant="soft">{t(`lang.${lang}`)}</Badge>
            </li>
          ))}
        </ul>
        <Link href={href} className="tap-link inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          {t("card.details")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
