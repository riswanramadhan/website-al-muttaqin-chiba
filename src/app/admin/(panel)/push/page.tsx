import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { IconCircle, Progress } from "@/components/ui/primitives";
import { AdminPageHeader } from "@/components/admin/shell";
import { PushForm } from "@/components/admin/push-form";
import { getAdminT } from "@/components/admin/lang.server";
import { getPanelContext, guardFor } from "@/components/admin/context.server";
import { getPushStats } from "@/components/admin/data";
import { formatAdminNumber, LOCALES } from "@/components/admin/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getAdminT();
  return { title: t("push.title"), description: t("push.subtitle") };
}

export default async function AdminPushPage() {
  const ctx = await getPanelContext();
  const { t, lang } = ctx;
  const stats = await getPushStats();
  const pushReady = Boolean(process.env.PUSH_CRON_SECRET && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

  return (
    <>
      <AdminPageHeader title={t("push.title")} description={t("push.subtitle")} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <div className="flex items-center gap-4">
            <IconCircle tone="soft">
              <Bell />
            </IconCircle>
            <div>
              <p className="text-sm text-muted-foreground">{t("push.subscribers")}</p>
              <p className="tabular text-3xl font-bold">{formatAdminNumber(stats.total, lang)}</p>
            </div>
          </div>
          <p className="mt-6 text-sm font-semibold">{t("push.perLanguage")}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {LOCALES.map((l) => (
              <li key={l}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{t(`content.localeNames.${l}`)}</span>
                  <span className="tabular font-semibold">{formatAdminNumber(stats.byLocale[l], lang)}</span>
                </div>
                <Progress value={stats.byLocale[l]} max={Math.max(stats.total, 1)} label={t(`content.localeNames.${l}`)} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>{t("push.broadcast")}</CardTitle>
          <CardDescription className="mt-1.5">{t("push.broadcastHint")}</CardDescription>
          {!ctx.demo && !pushReady && <p className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm">{t("push.notConfigured")}</p>}
          <div className="mt-5">
            <PushForm guard={guardFor(ctx, ["content_admin"])} />
          </div>
        </Card>
      </div>
    </>
  );
}
