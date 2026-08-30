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
    <footer className="border-t border-white/10 bg-ink py-14 md:py-16">
      <div className="shell grid gap-10 md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
        <div>
          <Link href={`/${locale}`} aria-label="Common Quest, retour a l’accueil" className="inline-block transition-opacity hover:opacity-80">
            <Image
              src={logoUrl ?? "/brand/logo-horiz-jaune.png"}
              alt="Common Quest"
              width={640}
              height={192}
              className="h-16 w-auto md:h-24"
            />
          </Link>
          <p className="mt-6 max-w-sm font-display text-2xl uppercase leading-[1] md:text-[26px]">
            {dict.footer.baseline}
          </p>
          <p className="mt-4 text-base text-smoke">{dict.footer.prism}</p>
        </div>

        <div className="space-y-3">
          <p className="mb-4 font-display text-[15px] uppercase tracking-[0.05em] text-acid">Navigation</p>
          <Link href={`/${locale}/programme`} className="block hover:text-acid">{dict.nav.programme}</Link>
          <Link href={`/${locale}/infos`} className="block hover:text-acid">{dict.nav.infos}</Link>
          <Link href={`/${locale}/connexion`} className="block hover:text-acid">{dict.nav.compte}</Link>
          <Link href={`/${locale}/mentions-legales`} className="block text-smoke hover:text-paper">{dict.footer.legal}</Link>
          <Link href={`/${locale}/confidentialite`} className="block text-smoke hover:text-paper">{dict.footer.privacy}</Link>
        </div>

        <div className="space-y-4">
          <p className="mb-4 font-display text-[15px] uppercase tracking-[0.05em] text-acid">{dict.footer.follow}</p>
          <SocialLinks />
          <a href="mailto:associationprism.hello@gmail.com" className="block break-all pt-2 hover:text-acid">
            associationprism.hello@gmail.com
          </a>
        </div>
      </div>

      <div className="shell mt-10 border-t border-white/10 pt-6 text-[12px] uppercase tracking-[0.14em] text-smoke">
        Common Quest, Nantes
      </div>
    </footer>
  );
}
