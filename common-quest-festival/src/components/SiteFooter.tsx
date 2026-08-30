import Link from "next/link";
import Image from "next/image";
import SocialLinks from "./SocialLinks";
import type { Locale, Dictionary } from "@/i18n";

export default function SiteFooter({
  locale,
  dict,
  logoUrl
}: {
  locale: Locale;
  dict: Dictionary;
  logoUrl?: string | null;
}) {
  return (
    <footer className="border-t border-white/10 bg-ink py-16">
      <div className="shell grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src={logoUrl ?? "/brand/logo-horiz-jaune.png"}
            alt="Common Quest"
            width={640}
            height={192}
            className="h-16 w-auto"
          />
          <p className="mt-6 max-w-sm font-display text-4xl uppercase leading-[0.95]">{dict.footer.baseline}</p>
          <p className="mt-5 text-base text-smoke">{dict.footer.prism}</p>
        </div>

        <div className="space-y-3">
          <p className="eyebrow mb-4">Navigation</p>
          <Link href={`/${locale}/programme`} className="block hover:text-acid">{dict.nav.programme}</Link>
          <Link href={`/${locale}/infos`} className="block hover:text-acid">{dict.nav.infos}</Link>
          <Link href={`/${locale}/connexion`} className="block hover:text-acid">{dict.nav.compte}</Link>
          <Link href={`/${locale}/mentions-legales`} className="block text-smoke hover:text-paper">{dict.footer.legal}</Link>
          <Link href={`/${locale}/confidentialite`} className="block text-smoke hover:text-paper">{dict.footer.privacy}</Link>
        </div>

        <div className="space-y-4">
          <p className="eyebrow mb-4">{dict.footer.follow}</p>
          <SocialLinks />
          <a href="mailto:associationprism.hello@gmail.com" className="block pt-2 hover:text-acid">
            associationprism.hello@gmail.com
          </a>
        </div>
      </div>

      <div className="shell mt-12 border-t border-white/10 pt-6 font-mono text-[12px] uppercase tracking-[0.14em] text-smoke">
        Common Quest, Nantes
      </div>
    </footer>
  );
}
