"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Locale, Dictionary } from "@/i18n";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: Locale;
  dict: Dictionary;
  userEmail: string | null;
  isAdmin: boolean;
};

export default function SiteHeader({ locale, dict, userEmail, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}/programme`, label: dict.nav.programme },
    { href: `/${locale}/infos`, label: dict.nav.infos }
  ];

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid || open ? "bg-ink/95 backdrop-blur border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href={`/${locale}`} aria-label="Common Quest, accueil" className="shrink-0">
          <Image src="/brand/logo-horiz-jaune.png" alt="Common Quest" width={150} height={45} priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-mono text-xs uppercase tracking-[0.16em] transition-colors hover:text-acid ${
                pathname.startsWith(l.href) ? "text-acid" : "text-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href={`/${locale}/admin`} className="font-mono text-xs uppercase tracking-[0.16em] text-violet">
              {dict.nav.admin}
            </Link>
          )}
          <LanguageSwitcher locale={locale} />
          {userEmail ? (
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/compte`} className="font-mono text-xs uppercase tracking-[0.16em] hover:text-acid">
                {dict.nav.compte}
              </Link>
              <button onClick={signOut} className="font-mono text-xs uppercase tracking-[0.16em] text-smoke hover:text-paper">
                {dict.nav.deconnexion}
              </button>
            </div>
          ) : (
            <Link href={`/${locale}/connexion`} className="font-mono text-xs uppercase tracking-[0.16em] hover:text-acid">
              {dict.nav.connexion}
            </Link>
          )}
          <Link href={`/${locale}/programme`} className="btn-acid">
            {dict.nav.billetterie}
          </Link>
        </nav>

        <button
          className="flex items-center gap-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
        >
          <span className="font-mono text-xs uppercase tracking-[0.16em]">{open ? dict.nav.fermer : dict.nav.menu}</span>
          <span className="relative block h-4 w-6" aria-hidden>
            <span className={`absolute left-0 h-0.5 w-6 bg-acid transition-all ${open ? "top-2 rotate-45" : "top-0.5"}`} />
            <span className={`absolute left-0 top-2 h-0.5 w-6 bg-acid transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-acid transition-all ${open ? "top-2 -rotate-45" : "top-3.5"}`} />
          </span>
        </button>
      </div>

      {open && (
        <div id="menu-mobile" className="border-t border-white/10 bg-ink md:hidden">
          <div className="shell flex flex-col gap-1 py-5">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="py-3 font-display text-2xl">
                {l.label}
              </Link>
            ))}
            <Link href={`/${locale}/programme`} className="py-3 font-display text-2xl text-acid">
              {dict.nav.billetterie}
            </Link>
            {isAdmin && (
              <Link href={`/${locale}/admin`} className="py-3 font-display text-2xl text-violet">
                {dict.nav.admin}
              </Link>
            )}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4">
              <LanguageSwitcher locale={locale} />
              {userEmail ? (
                <button onClick={signOut} className="font-mono text-xs uppercase tracking-[0.16em] text-smoke">
                  {dict.nav.deconnexion}
                </button>
              ) : (
                <Link href={`/${locale}/connexion`} className="font-mono text-xs uppercase tracking-[0.16em]">
                  {dict.nav.connexion}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
