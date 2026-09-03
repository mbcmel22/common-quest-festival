import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import { getEvent, getDict } from "@/lib/queries";
import { formatRange, formatTime, categoryLabels } from "@/lib/format";
import VideoEmbed from "@/components/VideoEmbed";
import CoverImage from "@/components/CoverImage";
import SocialLinks, { normalizeSocialGroups } from "@/components/SocialLinks";
import FavoriteButton from "@/components/FavoriteButton";

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

export default async function EventPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ jour?: string; discipline?: string; tarif?: string }>;
}) {
  const { locale, slug } = await params;
  const filters = await searchParams;
  const dict = await getDict(locale);
  const event = await getEvent(slug, locale);
  if (!event) notFound();

  const time = formatRange(event.start_time, event.end_time, locale);

  // On revient au programme avec les memes filtres qu a l aller
  const backQuery = new URLSearchParams();
  if (filters.jour) backQuery.set("jour", filters.jour);
  if (filters.discipline) backQuery.set("discipline", filters.discipline);
  if (filters.tarif) backQuery.set("tarif", filters.tarif);
  const backHref = `/${locale}/programme${backQuery.toString() ? `?${backQuery}` : ""}`;
  const videos = [
    ...(Array.isArray(event.video_urls) ? (event.video_urls as string[]) : []),
    ...(event.video_url && !(event.video_urls as string[] | null)?.length ? [event.video_url] : [])
  ].filter((url) => typeof url === "string" && url.trim().length > 0);
  const socialGroups = normalizeSocialGroups(event.social_links).filter((group) =>
    Object.values(group.links).some((url) => !!url && String(url).trim().length > 0)
  );

  return (
    <article>
      {/* Visuel de tete : l affiche entiere, sans texte par-dessus */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-soft sm:aspect-[21/9] sm:max-h-[60vh]">
        {event.cover_url ? (
          <CoverImage src={event.cover_url} alt={event.t?.title ?? ""} sizes="100vw" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet/60 via-ink to-ink" />
        )}
        {event.photo_credit && (
          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-ink/70 px-3 py-1 text-[11px] text-paper/70 backdrop-blur">
            {dict.event.photoCredit} : {event.photo_credit}
          </span>
        )}
      </div>

      {/* Titre : sur fond plein, toujours lisible */}
      <header className="shell border-b border-white/10 py-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag border-acid bg-acid text-ink">{categoryLabels[locale][event.category]}</span>
          {event.t?.event_type && <span className="tag text-paper/80">{event.t.event_type}</span>}
        </div>
        <h1 className="mt-4 display-l max-w-4xl">{event.t?.title}</h1>
        {event.t?.tagline && <p className="mt-3 max-w-2xl text-lg text-paper/80">{event.t.tagline}</p>}
        {event.t?.partner_note && <p className="mt-3 max-w-2xl text-[15px] text-acid">{event.t.partner_note}</p>}
      </header>

      <div className="shell grid gap-12 py-12 md:grid-cols-[1.4fr_1fr] md:py-16">
        <div>
          <Link href={backHref} className="eyebrow hover:text-acid">
            &larr; {dict.event.back}
          </Link>
          {event.t?.description && (
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-paper/85">{event.t.description}</p>
          )}

          {videos.length > 0 && (
            <div className="mt-10 space-y-5">
              {videos.map((url, index) => (
                <VideoEmbed key={`${url}-${index}`} url={url} title={`${event.t?.title ?? "Common Quest"} ${index + 1}`} />
              ))}
            </div>
          )}

          {socialGroups.length > 0 && (
            <section className="mt-10 space-y-6">
              {socialGroups.map((group, index) => (
                <div key={index}>
                  <h2 className="font-display text-[16px] uppercase tracking-[0.04em] text-acid">
                    {group.label?.trim() || dict.event.follow}
                  </h2>
                  <div className="mt-3">
                    <SocialLinks socials={group.links} withDefaults={false} size="sm" />
                  </div>
                </div>
              ))}
            </section>
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

          {event.t?.lineup_note && (
            <section className="mt-10">
              <h2 className="display-m">{dict.event.lineup}</h2>
              <p className="mt-3 whitespace-pre-line text-paper/80">{event.t.lineup_note}</p>
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
              <dd className="mt-1 font-display text-xl uppercase md:text-2xl">
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
              <dd className="mt-1 font-display text-xl uppercase text-acid md:text-2xl">
                {event.is_free ? dict.programme.free : event.is_pwyw ? dict.programme.pwyw : event.price_label}
              </dd>
              {event.is_pwyw && !event.is_free && event.price_label && (
                <dd className="mt-1 text-sm text-smoke">{event.price_label}</dd>
              )}
            </div>
          </dl>

          <div className="mt-5">
            <FavoriteButton eventId={event.id} locale={locale} dict={dict} />
          </div>

          <div className="mt-6">
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
