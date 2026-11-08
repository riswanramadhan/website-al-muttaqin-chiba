import type { Locale } from "@/lib/types";
import { getPrograms } from "@/lib/data";
import { ProgramCard } from "@/components/programs/program-card";

/** Grid kartu program dari getPrograms(); `limit` membatasi jumlah (mis. untuk beranda). */
export async function ProgramGrid({ locale, limit }: { locale: Locale; limit?: number }) {
  const all = await getPrograms();
  const programs = limit ? all.slice(0, limit) : all;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((program, i) => (
        <div key={program.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
          <ProgramCard program={program} locale={locale} />
        </div>
      ))}
    </div>
  );
}
