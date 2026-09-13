import Link from "next/link";
import { redirect } from "next/navigation";
import { getDict, getSessionContext } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { formatWhen } from "@/lib/format";
import AccountForm from "@/components/AccountForm";
import type { Locale } from "@/i18n";

export const metadata = { title: "Mon compte . Common Quest", robots: { index: false } };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  const { user, profile, isAdmin } = await getSessionContext();
  if (!user) redirect(`/${locale}/connexion`);

  const supabase = await createClient();
  const { data: favorites } = await supabase
    .from("favorites")
    .select("events(id, slug, event_date, start_time, end_time, venue, translations:event_translations(locale, title))")
    .eq("user_id", user.id);

  const rows = (favorites ?? [])
    .map((row: { events: unknown }) => row.events as {
      id: string;
      slug: string;
      event_date: string;
      start_time: string | null;
      end_time: string | null;
      venue: string | null;
      translations: { locale: string; title: string }[];
    } | null)
    .filter(Boolean)
    .sort((a, b) => (a!.event_date < b!.event_date ? -1 : 1));

  return (
    <section className="shell max-w-2xl py-14 md:py-20">
      <h1 className="display-l">
        {dict.account.hello} {profile?.full_name || user.email}
      </h1>

      <AccountForm
        dict={dict}
        initialName={profile?.full_name ?? ""}
        initialNewsletter={profile?.newsletter_opt_in ?? false}
        email={user.email ?? ""}
      />

      {/* Favoris */}
      <section className="mt-14">
        <h2 className="display-m">{dict.account.favorites}</h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-[15px] text-smoke">{dict.account.favoritesEmpty}</p>
        ) : (
          <ul className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/12">
            {rows.map((event) => {
              const title =
                event!.translations?.find((t) => t.locale === locale)?.title ??
                event!.translations?.[0]?.title ??
                event!.slug;
              return (
                <li key={event!.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg uppercase">{title}</p>
                    <p className="text-[14px] text-smoke">
                      {formatWhen(event!.event_date, event!.start_time, event!.end_time, locale)}
                      {event!.venue ? `. ${event!.venue}` : ""}
                    </p>
                  </div>
                  <Link href={`/${locale}/programme/${event!.slug}`} className="btn-ghost btn-sm">
                    {dict.nav.programme}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {isAdmin && (
        <Link href={`/${locale as Locale}/admin`} className="btn-violet btn-sm mt-12">
          {dict.nav.admin}
        </Link>
      )}

      <section className="mt-14 rounded-2xl border border-white/12 p-6">
        <h2 className="display-m">{dict.account.deleteTitle}</h2>
        <p className="mt-3 text-[15px] text-paper/70">{dict.account.deleteText}</p>
        <a href="mailto:associationprism.hello@gmail.com?subject=Suppression%20de%20mon%20compte" className="btn-ghost btn-sm mt-5">
          {dict.account.deleteCta}
        </a>
      </section>
    </section>
  );
}
