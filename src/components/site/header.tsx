import * as React from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { NAV_GROUPS, PRIMARY_LINKS } from "@/components/site/nav-config";
import { HeaderClient, type HeaderData } from "@/components/site/header-client";

/** Header situs (Server Component): menyiapkan label terjemahan lalu merender bagian interaktif. */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const data: HeaderData = {
    siteName: tc("siteName"),
    tagline: tc("city"),
    primary: PRIMARY_LINKS.map((l) => ({ ...l, label: t(l.key) })),
    groups: NAV_GROUPS.map((g) => ({
      key: g.key,
      label: t(`groups.${g.key}`),
      links: g.links.map((l) => ({ ...l, label: t(l.key), description: t.has(`descriptions.${l.key}`) ? t(`descriptions.${l.key}`) : undefined })),
    })),
    labels: {
      openMenu: tc("a11y.openMenu"),
      closeMenu: tc("a11y.closeMenu"),
      mainNav: tc("a11y.mainNav"),
      openApp: tc("actions.openApp"),
      skip: tc("a11y.skipToContent"),
    },
  };

  return <HeaderClient data={data} />;
}
