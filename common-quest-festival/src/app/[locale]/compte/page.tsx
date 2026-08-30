import Link from "next/link";
import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n";
import { getSessionContext, getDict } from "@/lib/queries";
import AccountForm from "@/components/AccountForm";

export const metadata = { title: "Mon compte . Common Quest", robots: { index: false } };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  const { user, profile, isAdmin } = await getSessionContext();
  if (!user) redirect(`/${locale}/connexion`);

  return (
    <section className="shell max-w-2xl py-16 md:py-24">
      <p className="eyebrow">{dict.account.hello}</p>
      <h1 className="mt-3 display-l">{profile?.full_name || user.email}</h1>

      <AccountForm
        dict={dict}
        initialName={profile?.full_name ?? ""}
        initialNewsletter={profile?.newsletter_opt_in ?? false}
        email={user.email ?? ""}
      />

      {isAdmin && (
        <Link href={`/${locale}/admin`} className="btn-violet mt-10">
          {dict.nav.admin}
        </Link>
      )}

      <section className="mt-16 rounded-2xl border border-white/12 p-6">
        <h2 className="display-m">{dict.account.deleteTitle}</h2>
        <p className="mt-3 text-sm text-paper/70">{dict.account.deleteText}</p>
        <a href="mailto:associationprism.hello@gmail.com?subject=Suppression%20de%20mon%20compte" className="btn-ghost mt-5">
          {dict.account.deleteCta}
        </a>
      </section>
    </section>
  );
}
