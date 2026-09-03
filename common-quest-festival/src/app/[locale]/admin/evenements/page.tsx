import { getDictionary } from "@/i18n";
import { createClient } from "@/lib/supabase/server";
import AdminEventList, { type AdminEventRow } from "@/components/AdminEventList";

export const dynamic = "force-dynamic";

export default async function AdminEvents({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "id, slug, day_index, event_date, start_time, end_time, venue, category, is_free, is_pwyw, is_published, is_highlight, translations:event_translations(locale, title)"
    )
    .order("event_date")
    .order("start_time", { nullsFirst: false });

  return <AdminEventList locale={locale} dict={dict} events={(data ?? []) as AdminEventRow[]} />;
}
