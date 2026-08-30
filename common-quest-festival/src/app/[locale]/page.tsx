import Link from "next/link";
import Image from "next/image";
import { getDictionary, type Locale } from "@/i18n";
import { getEvents } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import Marquee from "@/components/Marquee";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const events = await getEvents(locale);
  const highlights = events.filter((e) => e.is_highlight).slice(0, 3);
  const countByDay = [1, 2, 3, 4].map((day) => events.filter((e) => e.day_index === day).length);

  return (
    <>
      {/* HERO : la question du festival, en grand */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute -right-24 -top-16 h-[420px] w-[420px] opacity-20 blur-[2px] md:right-0 md:h-[560px] md:w-[560px]"
          aria-hidden
        >
          <Image src="/brand/picto-violet.png" alt="" fill className="object-contain" priority />
        </div>

        <div className="shell relative py-20 md:py-28">
          <p className="eyebrow reveal">
            {dict.hero.eyebrow} . {dict.hero.dates}
          </p>
          <h1 className="reveal mt-6 display-xl">
            <span className="block text-paper">{dict.hero.question}</span>
            <span className="mt-1 block text-acid">{dict.hero.answer}</span>
          </h1>
          <p className="reveal mt-8 max-w-xl text-lg text-paper/75">{dict.hero.place}</p>
          <div className="reveal mt-9 flex flex-wrap gap-3">
            <Link href={`/${locale}/programme`} className="btn-acid">
              {dict.hero.cta}
            </Link>
            <Link href={`/${locale}/infos`} className="btn-ghost">
              {dict.nav.infos}
            </Link>
          </div>
        </div>
      </section>

      <Marquee text={dict.home.ticker} />

      {/* INTRO */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <h2 className="display-l">{dict.home.introTitle}</h2>
          <div>
            <p className="text-lg leading-relaxed text-paper/80">{dict.home.introText}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {dict.home.disciplines.map((d) => (
                <li key={d} className="tag text-paper/80">
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* LE PARCOURS : quatre journees reliees par le fil de la quete */}
      <section className="bg-paper py-20 text-ink md:py-28">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-ink/50">{dict.home.programmeTitle}</p>
              <h2 className="mt-3 display-l">{dict.home.programmeText}</h2>
            </div>
            <Link href={`/${locale}/programme`} className="btn-ink">
              {dict.home.programmeCta}
            </Link>
          </div>

          <ol className="trail mt-14 space-y-4">
            {dict.common.days.map((day, index) => (
              <li key={day} className="flex items-start gap-5 md:gap-8">
                <span className="marker mt-6">{index + 1}</span>
                <Link
                  href={`/${locale}/programme?jour=${index + 1}`}
                  className="group relative w-full overflow-hidden rounded-2xl border border-ink/12 bg-white px-6 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink md:px-9 md:py-8"
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-violet transition-all duration-300 group-hover:w-full" aria-hidden />
                  <span className="relative flex flex-wrap items-baseline justify-between gap-3 transition-colors group-hover:text-white">
                    <span className="font-display text-3xl md:text-5xl">{day}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] opacity-60">
                      {countByDay[index]} {countByDay[index] > 1 ? "rendez-vous" : "rendez-vous"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TEMPS FORTS */}
      {highlights.length > 0 && (
        <section className="shell py-20 md:py-28">
          <h2 className="display-l">{dict.home.highlightsTitle}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((event) => (
              <EventCard key={event.id} event={event} locale={locale as Locale} dict={dict} />
            ))}
          </div>
        </section>
      )}

      {/* EQUIPE */}
      <section className="border-t border-white/10 py-20 md:py-28">
        <div className="shell grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="eyebrow">{dict.home.teamTitle}</p>
            <h2 className="mt-4 display-l">PRISM</h2>
            <p className="mt-6 max-w-lg text-lg text-paper/75">{dict.home.teamText}</p>
            <Link href={`/${locale}/infos#equipe`} className="btn-violet mt-8">
              {dict.home.teamCta}
            </Link>
          </div>
          <div className="relative aspect-square w-full max-w-sm justify-self-center md:justify-self-end">
            <Image src="/brand/picto-jaune.png" alt="" fill className="object-contain" />
          </div>
        </div>
      </section>
    </>
  );
}
