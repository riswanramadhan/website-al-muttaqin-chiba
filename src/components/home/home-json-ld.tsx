import { getPrayerConfig, getProfile } from "@/lib/data";
import { getPrayerTimesToday } from "@/lib/prayer";
import { siteName, siteUrl } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { formatTime, pick } from "@/lib/utils/i18n";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HALF_HOUR_MS = 30 * 60 * 1000;

/**
 * Data terstruktur beranda: `Mosque` (nama, alamat, geo, jam buka, sosial) dan `WebSite`
 * dengan SearchAction. Jam buka = 30 menit sebelum Subuh s.d. 30 menit setelah Isya hari ini.
 */
export async function HomeJsonLd({ locale }: { locale: Locale }) {
  const [profile, config] = await Promise.all([getProfile(), getPrayerConfig()]);
  const today = getPrayerTimesToday(config, profile.coordinates);
  const opens = formatTime(today.times.fajr.getTime() - HALF_HOUR_MS, "en");
  const closes = formatTime(today.times.isha.getTime() + HALF_HOUR_MS, "en");
  const url = `${siteUrl}/${locale}`;
  const sameAs = Object.values(profile.social).filter((v): v is string => Boolean(v));

  const mosque = {
    "@context": "https://schema.org",
    "@type": "Mosque",
    "@id": `${siteUrl}/#mosque`,
    name: pick(profile.name, locale),
    alternateName: profile.shortName,
    description: pick(profile.description, locale),
    url,
    telephone: profile.phone,
    email: profile.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: pick(profile.address, locale),
      addressLocality: pick(profile.city, locale),
      addressRegion: pick(profile.prefecture, locale),
      postalCode: profile.postalCode,
      addressCountry: "JP",
    },
    geo: { "@type": "GeoCoordinates", latitude: profile.coordinates.lat, longitude: profile.coordinates.lng },
    hasMap: profile.googleMapsUrl,
    maximumAttendeeCapacity: profile.capacity,
    openingHours: `Mo-Su ${opens}-${closes}`,
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: DAYS, opens, closes },
    sameAs,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteName,
    url,
    inLanguage: locale,
    publisher: { "@id": `${siteUrl}/#mosque` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify([mosque, website]).replace(/</g, "\u003c") }}
    />
  );
}
