import Link from "next/link";
import { getDictionary } from "@/i18n";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const supabase = await createClient();

  const [{ count: eventsCount }, { count: publishedCount }, { count: teamCount }] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("team_members").select("*", { count: "exact", head: true })
  ]);

  const cards = [
    { label: dict.admin.events, value: `${publishedCount ?? 0} / ${eventsCount ?? 0}`, href: `/${locale}/admin/evenements` },
    { label: dict.admin.team, value: String(teamCount ?? 0), href: `/${locale}/admin/equipe` },
    { label: dict.admin.settings, value: "Infos pratiques", href: `/${locale}/admin/reglages` }
  ];

  return (
    <div>
      <h1 className="display-l">{dict.admin.title}</h1>
      <p className="mt-4 text-ink/70">{dict.admin.subtitle}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-ink/12 bg-white p-6 transition-all hover:-translate-y-1 hover:border-violet"
          >
            <p className="eyebrow text-ink/50">{card.label}</p>
            <p className="mt-3 font-display text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
