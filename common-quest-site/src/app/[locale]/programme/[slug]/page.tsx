import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import { getEvent } from "@/lib/queries";
import { formatRange, formatTime, categoryLabels } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEvent(slug, locale);
  if (!event) return {};
  return {
    title: `${event.t?.title} . Common Quest`,
    description: event.t?.tagline ?? undefined,
    openGraph: { images: event.cover_url ? [event.cover_url] : undefined }
  };
}

export default async function EventPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const event = await getEvent(slug, locale);
  if (!event) notFound();

  const time = formatRange(event.start_time, event.end_time, locale);

  return (
    <article>
      {/* Visuel de tete */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden bg-ink-soft">
        {event.cover_url ? (
          <Image src={event.cover_url} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet/60 via-ink to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="shell absolute inset-x-0 bottom-0 pb-10">
          <span className="tag bg-acid text-ink">{categoryLabels[locale][event.category]}</span>
          <h1 className="mt-4 display-l max-w-3xl">{event.t?.title}</h1>
          {event.t?.tagline && <p className="mt-3 max-w-2xl text-lg text-paper/80">{event.t.tagline}</p>}
        </div>
      </div>

      <div className="shell grid gap-12 py-14 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div>
          <Link href={`/${locale}/programme`} className="eyebrow hover:text-acid">
            &larr; {dict.event.back}
          </Link>
          {event.t?.description && (
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-paper/85">{event.t.description}</p>
          )}

          {event.artists?.length > 0 && (
            <section className="mt-12">
              <h2 className="display-m">{dict.event.lineup}</h2>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                {event.artists.map((artist) => (
                  <li key={artist.id} className="flex items-center gap-4 rounded-2xl border border-white/12 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-ink-soft">
                      {artist.photo_url ? (
                        <Image src={artist.photo_url} alt={artist.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center font-display text-xl text-acid">
                          {artist.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl">{artist.name}</p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
                        {[artist.discipline, artist.country].filter(Boolean).join(" . ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.t?.practical_info && (
            <section className="mt-12">
              <h2 className="display-m">{dict.event.infosPratiques}</h2>
              <p className="mt-4 whitespace-pre-line text-paper/80">{event.t.practical_info}</p>
            </section>
          )}
        </div>

        {/* Bloc pratique, colle en haut sur grand ecran */}
        <aside className="h-max rounded-2xl border border-white/12 bg-ink-soft p-6 md:sticky md:top-28">
          <dl className="space-y-5">
            <div>
              <dt className="eyebrow">{dict.event.horaires}</dt>
              <dd className="mt-1 font-display text-2xl">
                {dict.common.days[event.day_index - 1]}
                <span className="block text-acid">{time}</span>
              </dd>
            </div>
            {event.doors_time && (
              <div>
                <dt className="eyebrow">{dict.event.doors}</dt>
                <dd className="mt-1 font-mono">{formatTime(event.doors_time, locale)}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">{dict.event.lieu}</dt>
              <dd className="mt-1">{event.venue}</dd>
              {event.address && <dd className="text-sm text-smoke">{event.address}</dd>}
            </div>
            <div>
              <dt className="eyebrow">{dict.event.tarifs}</dt>
              <dd className="mt-1 font-display text-3xl uppercase text-acid">
                {event.is_free ? dict.programme.free : event.is_pwyw ? dict.programme.pwyw : event.price_label}
              </dd>
              {event.is_pwyw && !event.is_free && event.price_label && (
                <dd className="mt-1 text-sm text-smoke">{event.price_label}</dd>
              )}
            </div>
          </dl>

          <div className="mt-7">
            {event.is_free && !event.ticket_url ? (
              <p className="rounded-full border-2 border-acid/40 px-5 py-3.5 text-center font-display text-[16px] uppercase tracking-[0.04em] text-acid">
                {dict.event.ctaFree}
              </p>
            ) : event.ticket_url ? (
              <a href={event.ticket_url} target="_blank" rel="noreferrer noopener" className="btn-acid w-full">
                {event.is_pwyw ? dict.event.ctaPwyw : dict.event.cta}
              </a>
            ) : (
              <p className="rounded-full border-2 border-white/20 px-5 py-3.5 text-center font-display text-[16px] uppercase tracking-[0.04em] text-smoke">
                {dict.event.ctaSoon}
              </p>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
