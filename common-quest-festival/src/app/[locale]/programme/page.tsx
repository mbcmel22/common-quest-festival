import Link from "next/link";
import { getDictionary, type Locale } from "@/i18n";
import { getEvents, getDict } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import { categoryLabels } from "@/lib/format";

export const revalidate = 60;

export default async function ProgrammePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ jour?: string; discipline?: string; tarif?: string }>;
}) {
  const { locale } = await params;
  const { jour, discipline, tarif } = await searchParams;
  const dict = await getDict(locale);
  const events = await getEvents(locale);

  const activeDay = jour && ["1", "2", "3", "4"].includes(jour) ? Number(jour) : null;
  const categories = Array.from(new Set(events.map((e) => e.category)));
  const activeCategory = discipline && categories.includes(discipline as never) ? discipline : null;
  const priceOptions = [
    { key: "gratuit", label: dict.programme.free },
    { key: "libre", label: dict.programme.pwyw },
    { key: "payant", label: dict.programme.paid }
  ];
  const activePrice = tarif && priceOptions.some((o) => o.key === tarif) ? tarif : null;
  const matchPrice = (event: { is_free: boolean; is_pwyw: boolean }) =>
    !activePrice ||
    (activePrice === "gratuit" && event.is_free) ||
    (activePrice === "libre" && !event.is_free && event.is_pwyw) ||
    (activePrice === "payant" && !event.is_free && !event.is_pwyw);

  const filtered = events.filter(
    (e) => (!activeDay || e.day_index === activeDay) && (!activeCategory || e.category === activeCategory) && matchPrice(e)
  );

  const buildHref = (next: { jour?: number | null; discipline?: string | null; tarif?: string | null }) => {
    const p = new URLSearchParams();
    const day = next.jour === undefined ? activeDay : next.jour;
    const cat = next.discipline === undefined ? activeCategory : next.discipline;
    const price = next.tarif === undefined ? activePrice : next.tarif;
    if (day) p.set("jour", String(day));
    if (cat) p.set("discipline", cat);
    if (price) p.set("tarif", price);
    const qs = p.toString();
    return `/${locale}/programme${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <section className="shell pb-8 pt-12 md:pt-16">
        <h1 className="display-xl">{dict.programme.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-paper/75">{dict.programme.intro}</p>
      </section>

      {/* Filtres : journee puis discipline */}
      <div className="relative z-30 border-y border-white/10 bg-ink/95 py-3 backdrop-blur md:sticky md:top-24">
        <div className="shell flex flex-col items-center gap-2.5">
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Link
              href={buildHref({ jour: null })}
              data-active={!activeDay}
              className={`tag whitespace-nowrap ${!activeDay ? "border-acid bg-acid text-ink" : "text-paper/70"}`}
            >
              {dict.programme.allDays}
            </Link>
            {dict.common.days.map((day, i) => (
              <Link
                key={day}
                href={buildHref({ jour: i + 1 })}
                data-active={activeDay === i + 1}
                className={`tag whitespace-nowrap ${activeDay === i + 1 ? "border-acid bg-acid text-ink" : "text-paper/70"}`}
              >
                {day}
              </Link>
            ))}
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Link
              href={buildHref({ discipline: null })}
              data-active={!activeCategory}
              className={`tag whitespace-nowrap ${!activeCategory ? "border-violet bg-violet text-white" : "text-smoke"}`}
            >
              {dict.programme.allCategories}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildHref({ discipline: cat })}
                data-active={activeCategory === cat}
                className={`tag whitespace-nowrap ${activeCategory === cat ? "border-violet bg-violet text-white" : "text-smoke"}`}
              >
                {categoryLabels[locale][cat]}
              </Link>
            ))}
          </div>
          <div className="flex w-full flex-wrap justify-center gap-2">
            <Link
              href={buildHref({ tarif: null })}
              data-active={!activePrice}
              className={`tag whitespace-nowrap ${!activePrice ? "border-paper bg-paper text-ink" : "text-smoke"}`}
            >
              {dict.programme.allPrices}
            </Link>
            {priceOptions.map((option) => (
              <Link
                key={option.key}
                href={buildHref({ tarif: option.key })}
                data-active={activePrice === option.key}
                className={`tag whitespace-nowrap ${activePrice === option.key ? "border-paper bg-paper text-ink" : "text-smoke"}`}
              >
                {option.label}
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
                <h2 className="mb-6 flex items-center gap-4 font-display text-2xl md:text-3xl">
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
