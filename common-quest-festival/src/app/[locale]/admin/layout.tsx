import Link from "next/link";
import { getDictionary } from "@/i18n";

export const metadata = { title: "Back office . Common Quest", robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const links = [
    { href: `/${locale}/admin`, label: dict.admin.title },
    { href: `/${locale}/admin/evenements`, label: dict.admin.events },
    { href: `/${locale}/admin/équipe`, label: dict.admin.team },
    { href: `/${locale}/admin/reglages`, label: dict.admin.settings }
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="shell py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
          <nav className="flex flex-wrap gap-2" aria-label="Back office">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-ink/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href={`/${locale}`} className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50 hover:text-violet">
            {dict.admin.backToSite}
          </Link>
        </div>
        <div className="pt-10">{children}</div>
      </div>
    </div>
  );
}
