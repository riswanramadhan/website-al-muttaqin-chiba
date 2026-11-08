import { getTranslations } from "next-intl/server";
import { CircleCheck } from "lucide-react";
import type { Locale } from "@/lib/types";
import { getDonationPrograms } from "@/lib/data";
import { formatCurrency, pick } from "@/lib/utils/i18n";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { IconCircle, Progress } from "@/components/ui/primitives";
import { PROGRAM_ICONS } from "@/components/donate/program-icon";

/**
 * Kartu program donasi dengan progres (PRD-05 §2). Server Component.
 * `columns` membatasi grid (App Jamaah memakai 2 agar tidak sempit).
 */
export async function DonationProgress({ locale, limit, columns = 3 }: { locale: Locale; limit?: number; columns?: 2 | 3 }) {
  const [programs, t] = await Promise.all([getDonationPrograms(), getTranslations({ locale, namespace: "donate" })]);
  const list = limit ? programs.slice(0, limit) : programs;

  return (
    <ul className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")}>
      {list.map((program) => {
        const Icon = PROGRAM_ICONS[program.icon];
        const completed = program.status === "completed";
        const target = program.target?.amount ?? 0;
        const raised = program.raised?.amount ?? 0;
        const percent = completed ? 100 : target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
        const badgeVariant = completed ? "success" : program.status === "closed" ? "outline" : "soft";
        return (
          <li key={program.id} className={cn("card-surface flex flex-col gap-4 p-5", completed && "bg-surface/60")}>
            <div className="flex items-start justify-between gap-3">
              <IconCircle tone={completed ? "default" : "soft"} shape="square">
                <Icon />
              </IconCircle>
              <Badge variant={badgeVariant}>
                {completed && <CircleCheck />}
                {t(`programs.status.${program.status}`)}
              </Badge>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold leading-snug">{pick(program.title, locale)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pick(program.description, locale)}</p>
            </div>
            {completed ? (
              <Progress value={100} tone="success" label={t("programs.status.completed")} />
            ) : target > 0 ? (
              <div className="space-y-2">
                <Progress value={percent} label={pick(program.title, locale)} />
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold tabular">
                    {t("programs.ofTarget", {
                      raised: formatCurrency(raised, program.raised?.currency ?? "JPY", locale),
                      target: formatCurrency(target, program.target?.currency ?? "JPY", locale),
                    })}
                  </span>
                  <span className="text-muted-foreground tabular">{t("programs.percent", { percent })}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("programs.noTarget")}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
