import Link from "next/link";
import Image from "next/image";
import type { EventWithTranslation } from "@/lib/types";
import { formatRange, categoryLabels } from "@/lib/format";
import type { Locale, Dictionary } from "@/i18n";

export default function EventCard({
  event,
  locale,
  dict
}: {
  event: EventWithTranslation;
  locale: Locale;
  dict: Dictionary;
}) {
  const title = event.t?.title ?? event.slug;
  const time = formatRange(event.start_time, event.end_time, locale);

  return (
    <Link href={`/${locale}/programme/${event.slug}`} className="event-card group focus:outline-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet/70 to-ink">
            <Image src="/brand/picto-jaune.png" alt="" width={90} height={90} className="opacity-70" />
          </div>
        )}
        <span className="absolute left-3 top-3 tag bg-ink/80 text-acid">
          {categoryLabels[locale][event.category]}
        </span>
        {event.is_free && (
          <span className="absolute right-3 top-3 tag bg-acid text-ink">{dict.programme.free}</span>
        )}
      </div>

      <div className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-acid">
          {dict.common.daysShort[event.day_index - 1]} {time && `. ${time}`}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight">{title}</h3>
        {event.t?.tagline && <p className="mt-2 text-sm text-paper/70">{event.t.tagline}</p>}
        <p className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
          <span>{event.venue}</span>
          <span className="text-paper transition-colors group-hover:text-acid">
            {event.price_label ?? ""}
          </span>
        </p>
      </div>
    </Link>
  );
}
