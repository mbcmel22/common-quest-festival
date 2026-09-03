import Link from "next/link";
import Image from "next/image";
import CoverImage from "./CoverImage";
import type { EventWithTranslation } from "@/lib/types";
import { formatWhen, categoryLabels } from "@/lib/format";
import type { Locale, Dictionary } from "@/i18n";

export default function EventCard({
  event,
  locale,
  dict,
  /** Filtres actifs, transmis pour pouvoir revenir exactement au meme endroit. */
  query
}: {
  event: EventWithTranslation;
  locale: Locale;
  dict: Dictionary;
  query?: string;
}) {
  const title = event.t?.title ?? event.slug;
  const when = formatWhen(event.event_date, event.start_time, event.end_time, locale);

  return (
    <Link
      href={`/${locale}/programme/${event.slug}${query ? `?${query}` : ""}`}
      className="event-card group focus:outline-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        {event.cover_url ? (
          <CoverImage src={event.cover_url} alt={title} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet/70 to-ink">
            <Image src="/brand/picto-jaune.png" alt="" width={48} height={48} className="opacity-60" />
          </div>
        )}
        <span className="absolute left-3 top-3 tag bg-ink/80 text-acid">
          {categoryLabels[locale][event.category]}
        </span>
        <span
          className={`absolute right-3 top-3 tag ${
            event.is_free
              ? "border-acid bg-acid text-ink"
              : event.is_pwyw
                ? "border-violet bg-violet text-white"
                : "border-white/40 bg-ink/80 text-paper"
          }`}
        >
          {event.is_free ? dict.programme.free : event.is_pwyw ? dict.programme.pwyw : dict.programme.paid}
        </span>
      </div>

      <div className="p-4 md:p-5">
        <p className="text-[14px] font-medium text-acid">{when}</p>
        <h3 className="mt-2 font-display text-xl uppercase leading-[1.1] md:text-[22px]">{title}</h3>
        {event.t?.tagline && <p className="mt-2 text-[15px] text-paper/70">{event.t.tagline}</p>}
        {event.venue && <p className="mt-3 text-[14px] text-smoke">{event.venue}</p>}
      </div>
    </Link>
  );
}
