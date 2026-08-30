import Link from "next/link";
import { getDictionary } from "@/i18n";
import { createClient } from "@/lib/supabase/server";
import { formatRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminEvents({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, slug, day_index, start_time, end_time, is_published, is_highlight, translations:event_translations(locale, title)")
    .order("day_index")
    .order("sort_order");

  const events = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="display-l">{dict.admin.events}</h1>
        <Link href={`/${locale}/admin/evenements/nouveau`} className="btn-ink">
          {dict.admin.newEvent}
        </Link>
      </div>

      <ul className="mt-10 divide-y divide-ink/10 rounded-2xl border border-ink/12 bg-white">
        {events.map((event: any) => {
          const title =
            event.translations?.find((t: any) => t.locale === locale)?.title ??
            event.translations?.[0]?.title ??
            event.slug;
          return (
            <li key={event.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display text-xl">{title}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
                  {dict.common.daysShort[event.day_index - 1]} . {formatRange(event.start_time, event.end_time, locale)} . /{event.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    event.is_published ? "bg-violet text-white" : "bg-ink/10 text-ink/60"
                  }`}
                >
                  {event.is_published ? dict.admin.published : dict.admin.draft}
                </span>
                <Link href={`/${locale}/admin/evenements/${event.id}`} className="btn-ink">
                  {dict.admin.edit}
                </Link>
              </div>
            </li>
          );
        })}
        {events.length === 0 && <li className="p-8 text-center text-ink/50">Aucun événement pour le moment.</li>}
      </ul>
    </div>
  );
}
