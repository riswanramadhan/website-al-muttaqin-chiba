import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/types";
import { getDictionary } from "@/lib/data";
import { AppScreenHeader } from "@/components/app/shell";
import { DictionarySearch } from "@/components/guides";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dictionary" });
  return { title: t("meta.title"), description: t("meta.description") };
}

/** Layar App Jamaah: kamus dakwah versi ringkas, kotak cari di atas, "Tunjukkan" sebagai aksi utama. */
export default async function AppDictionaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  setRequestLocale(raw);
  const locale = raw as Locale;
  const [t, ta, entries] = await Promise.all([getTranslations({ locale, namespace: "dictionary" }), getTranslations({ locale, namespace: "app" }), getDictionary()]);

  return (
    <div>
      <AppScreenHeader title={ta("screens.dictionary")} description={t("show.hint")} backLabel={ta("back")} />
      <DictionarySearch entries={entries} locale={locale} compact />
    </div>
  );
}
