import Link from "next/link";
import Image from "next/image";
import type { EventWithTranslation } from "@/lib/types";
import { formatWhen, categoryLabels } from "@/lib/format";
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
  const when = formatWhen(event.event_date, event.start_time, event.end_time, locale);

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
          <span className="absolute right-3 top-3 tag border-acid bg-acid text-ink">{dict.programme.free}</span>
        )}
        {!event.is_free && event.is_pwyw && (
          <span className="absolute right-3 top-3 tag border-violet bg-violet text-white">{dict.programme.pwyw}</span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[15px] font-medium text-acid">{when}</p>
        <h3 className="mt-3 font-display text-2xl uppercase leading-[0.98] md:text-[26px]">{title}</h3>
        {event.t?.tagline && <p className="mt-2 text-base text-paper/70">{event.t.tagline}</p>}
        <p className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[15px] text-smoke">
          <span>{event.venue}</span>
          <span className="font-medium text-paper transition-colors group-hover:text-acid">
            {event.price_label ?? ""}
          </span>
        </p>
      </div>
    </Link>
  );
}
