import Link from "next/link";
import Image from "next/image";
import type { Locale, Dictionary } from "@/i18n";

export default function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-white/10 bg-ink py-14">
      <div className="shell grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-horiz-jaune.png" alt="Common Quest" width={190} height={57} />
          <p className="mt-5 max-w-sm font-display text-2xl leading-tight">{dict.footer.baseline}</p>
          <p className="mt-4 text-sm text-smoke">{dict.footer.prism}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Navigation</p>
          <Link href={`/${locale}/programme`} className="block hover:text-acid">{dict.nav.programme}</Link>
          <Link href={`/${locale}/infos`} className="block hover:text-acid">{dict.nav.infos}</Link>
          <Link href={`/${locale}/connexion`} className="block hover:text-acid">{dict.nav.compte}</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">{dict.footer.follow}</p>
          <a href="https://www.instagram.com/commonquest_" target="_blank" rel="noreferrer noopener" className="block hover:text-acid">
            Instagram @commonquest_
          </a>
          <a href="mailto:associationprism.hello@gmail.com" className="block hover:text-acid">
            associationprism.hello@gmail.com
          </a>
          <Link href={`/${locale}/mentions-legales`} className="block text-smoke hover:text-paper">{dict.footer.legal}</Link>
          <Link href={`/${locale}/confidentialite`} className="block text-smoke hover:text-paper">{dict.footer.privacy}</Link>
        </div>
      </div>
      <div className="shell mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-smoke sm:flex-row sm:justify-between">
        <span>Common Quest 2026, Nantes</span>
        <span>1 &gt; 4.10.2026</span>
      </div>
    </footer>
  );
}
