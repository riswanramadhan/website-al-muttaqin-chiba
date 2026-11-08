import { getTranslations } from "next-intl/server";
import { CreditCard } from "lucide-react";
import type { Locale } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconCircle } from "@/components/ui/primitives";
import { SectionTag } from "@/components/ui/section-tag";

/** Placeholder gateway otomatis (Midtrans/Stripe): tampil hanya bila PAYMENT_GATEWAY_ENABLED=true (PRD-05 §8). */
export async function GatewayCard({ locale }: { locale: Locale }) {
  if (process.env.PAYMENT_GATEWAY_ENABLED !== "true") return null;
  const t = await getTranslations({ locale, namespace: "donate" });
  return (
    <section className="card-muted flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="gateway-title">
      <div className="flex items-start gap-4">
        <IconCircle tone="soft" size="lg">
          <CreditCard />
        </IconCircle>
        <div>
          <SectionTag tone="brand">{t("gateway.tag")}</SectionTag>
          <h2 id="gateway-title" className="mt-2 text-xl font-bold">
            {t("gateway.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("gateway.description")}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge variant="warning">{t("gateway.soon")}</Badge>
        <Button disabled aria-disabled>
          {t("gateway.soon")}
        </Button>
      </div>
    </section>
  );
}
