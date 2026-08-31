import Link from "next/link";
import Image from "next/image";
import { getDictionary, type Locale } from "@/i18n";
import { getEvents, getSetting, getDict } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import Marquee from "@/components/Marquee";
import { pickTicker, DEFAULT_SUPPORT_URL, type TickerSetting } from "@/lib/ticker";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  const events = await getEvents(locale);
  const ticker = await getSetting<TickerSetting>("ticker");
  const tickerText = pickTicker(ticker, "home", locale);
  const tickerSpeed = ticker?.speed_home ?? 75;
  const support = await getSetting<{ url?: string }>("support");
  const supportUrl = support?.url?.trim() || DEFAULT_SUPPORT_URL;
  const highlights = events.filter((e) => e.is_highlight).slice(0, 3);
  const countByDay = [1, 2, 3, 4].map((day) => events.filter((e) => e.day_index === day).length);

  return (
    <>
      {/* HERO : la question du festival, en grand */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="shell relative py-20 md:py-28">
          <h1 className="reveal display-xl">
            <span className="block text-paper">{dict.hero.question}</span>
            <span className="mt-3 block text-acid md:mt-4">{dict.hero.answer}</span>
          </h1>
          <p className="reveal mt-8 font-display text-2xl uppercase leading-tight text-paper/85 md:text-4xl">
            {dict.hero.dates}
          </p>
          <p className="reveal mt-2 text-lg text-paper/70">{dict.hero.place}</p>
          <div className="reveal mt-9 flex flex-wrap gap-3">
            <Link href={`/${locale}/programme`} className="btn-acid">
              {dict.hero.cta}
            </Link>
            <a href={supportUrl} target="_blank" rel="noreferrer noopener" className="btn-violet">
              {dict.nav.soutien}
            </a>
            <Link href={`/${locale}/infos`} className="btn-ghost">
              {dict.nav.infos}
            </Link>
          </div>
        </div>
      </section>

      <Marquee text={tickerText} speed={tickerSpeed} />

      {/* INTRO */}
      <section className="shell py-20 md:py-28">
        <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <h2 className="display-l">{dict.home.introTitle}</h2>
          <div>
            <p className="text-lg leading-relaxed text-paper/80">{dict.home.introText}</p>
          </div>
        </div>
      </section>

      {/* LE PARCOURS : quatre journees reliees par le fil de la quete */}
      <section className="bg-paper py-20 text-ink md:py-28">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="display-l max-w-2xl">{dict.home.programmeText}</h2>
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
                    <span className="text-[15px] opacity-70">
                      {countByDay[index]} rendez-vous
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
      <section className="border-t border-white/10 py-14 md:py-28">
        <div className="shell grid gap-6 md:grid-cols-[1fr_1fr] md:items-center md:gap-10">
          <div>
            <p className="eyebrow">{dict.home.teamTitle}</p>
            <h2 className="mt-4 display-l">PRISM</h2>
            <p className="mt-6 max-w-lg text-lg text-paper/75">{dict.home.teamText}</p>
            <Link href={`/${locale}/infos#equipe`} className="btn-violet mt-8">
              {dict.home.teamCta}
            </Link>
          </div>
          <div className="relative hidden aspect-square w-full max-w-[220px] justify-self-end md:block">
            <Image src="/brand/picto-jaune.png" alt="" fill sizes="220px" className="object-contain" />
          </div>
        </div>
      </section>
    </>
  );
}
