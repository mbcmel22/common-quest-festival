import Link from "next/link";
import { getDictionary, type Locale } from "@/i18n";
import { getEvents } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import { categoryLabels } from "@/lib/format";

export const revalidate = 60;

export default async function ProgrammePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jour?: string; discipline?: string }>;
}) {
  const { locale } = await params;
  const { jour, discipline } = await searchParams;
  const dict = getDictionary(locale);
  const events = await getEvents(locale);

  const activeDay = jour && ["1", "2", "3", "4"].includes(jour) ? Number(jour) : null;
  const categories = Array.from(new Set(events.map((e) => e.category)));
  const activeCategory = discipline && categories.includes(discipline as never) ? discipline : null;

  const filtered = events.filter(
    (e) => (!activeDay || e.day_index === activeDay) && (!activeCategory || e.category === activeCategory)
  );

  const buildHref = (next: { jour?: number | null; discipline?: string | null }) => {
    const p = new URLSearchParams();
    const day = next.jour === undefined ? activeDay : next.jour;
    const cat = next.discipline === undefined ? activeCategory : next.discipline;
    if (day) p.set("jour", String(day));
    if (cat) p.set("discipline", cat);
    const qs = p.toString();
    return `/${locale}/programme${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <section className="shell pb-10 pt-16 md:pt-24">
        <h1 className="display-xl">{dict.programme.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-paper/75">{dict.programme.intro}</p>
      </section>

      {/* Filtres : journee puis discipline */}
      <div className="sticky top-16 z-30 border-y border-white/10 bg-ink/95 py-3 backdrop-blur md:top-20">
        <div className="shell flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildHref({ jour: null })}
              className={`tag whitespace-nowrap ${!activeDay ? "bg-acid text-ink" : "text-paper/70"}`}
            >
              {dict.programme.allDays}
            </Link>
            {dict.common.days.map((day, i) => (
              <Link
                key={day}
                href={buildHref({ jour: i + 1 })}
                className={`tag whitespace-nowrap ${activeDay === i + 1 ? "bg-acid text-ink" : "text-paper/70"}`}
              >
                {day}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Link
              href={buildHref({ discipline: null })}
              className={`tag whitespace-nowrap ${!activeCategory ? "border-violet text-violet" : "text-smoke"}`}
            >
              {dict.programme.allCategories}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildHref({ discipline: cat })}
                className={`tag whitespace-nowrap ${activeCategory === cat ? "border-violet text-violet" : "text-smoke"}`}
              >
                {categoryLabels[locale][cat]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="shell py-14">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-lg text-smoke">{dict.programme.noEvents}</p>
        ) : (
          [1, 2, 3, 4]
            .filter((day) => filtered.some((e) => e.day_index === day))
            .map((day) => (
              <div key={day} className="mb-16">
                <h2 className="mb-6 flex items-center gap-4 font-display text-3xl md:text-4xl">
                  <span className="marker">{day}</span>
                  {dict.common.days[day - 1]}
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered
                    .filter((e) => e.day_index === day)
                    .map((event) => (
                      <EventCard key={event.id} event={event} locale={locale as Locale} dict={dict} />
                    ))}
                </div>
              </div>
            ))
        )}
      </section>
    </>
  );
}
