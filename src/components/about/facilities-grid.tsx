import * as React from "react";
import { Accessibility, Baby, Book, Droplets, Landmark, ParkingMeter, Users, Utensils, Wifi } from "lucide-react";
import type { Facility, Locale } from "@/lib/types";
import { pick } from "@/lib/utils/i18n";
import { IconCircle } from "@/components/ui/primitives";

/** Peta `Facility.icon` ke ikon lucide 1.x (ikon "parking" memakai ParkingMeter). */
const ICONS: Record<Facility["icon"], React.ComponentType<{ className?: string }>> = {
  landmark: Landmark,
  users: Users,
  baby: Baby,
  book: Book,
  utensils: Utensils,
  parking: ParkingMeter,
  accessibility: Accessibility,
  wifi: Wifi,
  droplets: Droplets,
};

/** Kartu fasilitas dengan ikon (PRD-03a). */
export function FacilitiesGrid({ items, locale }: { items: Facility[]; locale: Locale }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => {
        const Icon = ICONS[f.icon];
        return (
          <li key={f.id} className="card-surface flex flex-col gap-4 p-5">
            <IconCircle tone="soft" shape="square">
              <Icon />
            </IconCircle>
            <div>
              <p className="font-bold leading-snug">{pick(f.name, locale)}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pick(f.description, locale)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
