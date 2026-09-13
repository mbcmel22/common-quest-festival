import Link from "next/link";
import Image from "next/image";
import SocialLinks, { type Socials } from "./SocialLinks";
import type { Locale, Dictionary } from "@/i18n";
import type { Partner } from "@/lib/types";

const TORN_EDGE = "M0,40 L0,18 L32,26.8 L77,28.2 L109,16.8 L154,20.1 L177,25.3 L210,21.1 L253,10.5 L285,13.3 L305,18.9 L351,22.6 L370,20.3 L400,29.2 L438,23.7 L476,9.8 L494,26.0 L514,7.4 L538,27.1 L575,6.7 L607,13.8 L643,26.2 L677,11.6 L704,18.0 L743,8.0 L781,12.7 L816,29.9 L860,8.0 L886,13.6 L911,18.3 L929,7.7 L971,8.6 L992,26.3 L1022,7.6 L1040,26.3 L1058,11.1 L1077,17.3 L1117,15.5 L1137,19.6 L1161,24.7 L1187,14.1 L1214,14.0 L1245,24.2 L1266,9.2 L1306,8.4 L1325,17.2 L1358,10.3 L1393,10.5 L1427,10.6 L1440,24.5 L1440,20 L1440,40 Z";

export default function SiteFooter({
  locale,
  dict,
  logoUrl,
  socials,
  supportUrl,
  isLoggedIn = false,
  partners = []
}: {
  locale: Locale;
  dict: Dictionary;
  logoUrl?: string | null;
  socials?: Socials | null;
  supportUrl?: string;
  isLoggedIn?: boolean;
  partners?: Partner[];
}) {
  const visiblePartners = partners.filter((p) => p.is_published !== false && p.logo_url);
  return (
    <footer className="relative mt-8 bg-[#170D1E]">
      {/* Bord dechire : la page se termine comme une affiche arrachee */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute -top-[39px] left-0 h-10 w-full text-[#170D1E]"
      >
        <path d={TORN_EDGE} fill="currentColor" />
      </svg>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(60% 90% at 15% 0%, rgba(126,26,255,0.35), transparent 70%), radial-gradient(45% 70% at 90% 20%, rgba(231,255,54,0.12), transparent 70%)"
        }}
      />

      <div className="relative pb-12 pt-14">
        <div className="shell grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.25fr_1.35fr_0.9fr]">
          <div>
            <Link href={`/${locale}`} aria-label="Common Quest, retour a l accueil" className="inline-block transition-opacity hover:opacity-80">
              <Image
                src={logoUrl ?? "/brand/logo-horiz-jaune.png"}
                alt="Common Quest"
                width={891}
                height={264}
                className="h-12 w-auto md:h-16"
              />
            </Link>
            <p className="mt-6 max-w-sm font-display text-xl uppercase leading-[1.2] md:text-2xl">
              {dict.footer.baseline}
            </p>
            <p className="mt-4 text-[15px] text-smoke">{dict.footer.prism}</p>
            {supportUrl && (
              <a href={supportUrl} target="_blank" rel="noreferrer noopener" className="btn-violet btn-sm mt-6">
                {dict.nav.soutien}
              </a>
            )}
          </div>

          {/* Navigation : le site a gauche, les pages legales a droite, trois liens de chaque cote. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px]">
            <p className="col-span-2 mb-1 font-display text-[15px] uppercase tracking-[0.05em] text-acid">Navigation</p>
            <div className="space-y-2.5">
              <Link href={`/${locale}/programme`} className="block hover:text-acid">{dict.nav.programme}</Link>
              <Link href={`/${locale}/infos`} className="block hover:text-acid">{dict.nav.infos}</Link>
              <Link href={isLoggedIn ? `/${locale}/compte` : `/${locale}/connexion`} className="block hover:text-acid">
                {isLoggedIn ? dict.nav.compte : dict.nav.connexion}
              </Link>
            </div>
            <div className="space-y-2.5">
              <Link href={`/${locale}/mentions-legales`} className="block text-smoke hover:text-paper">{dict.footer.legal}</Link>
              <Link href={`/${locale}/confidentialite`} className="block text-smoke hover:text-paper">{dict.footer.privacy}</Link>
              <Link href={`/${locale}/cookies`} className="block text-smoke hover:text-paper">{dict.footer.cookies}</Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="mb-4 font-display text-[15px] uppercase tracking-[0.05em] text-acid">{dict.footer.follow}</p>
            <SocialLinks socials={socials} />
            <a href="mailto:associationprism.hello@gmail.com" className="block break-all pt-2 text-[15px] hover:text-acid">
              associationprism.hello@gmail.com
            </a>
          </div>
        </div>

        {visiblePartners.length > 0 && (
          <div className="shell mt-12 border-t border-white/10 pt-8">
            <p className="font-display text-[15px] uppercase tracking-[0.05em] text-acid">{dict.footer.partners}</p>
            {/*
              Les logos sont normalises en blanc sur fond transparent et alignes
              sur une hauteur commune : la largeur s adapte, jamais l inverse.
            */}
            <ul className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10 md:gap-x-12">
              {visiblePartners.map((partner) => {
                const logo = (
                  <Image
                    src={partner.logo_url as string}
                    alt={partner.name}
                    width={460}
                    height={200}
                    className="h-8 w-auto max-w-[130px] object-contain opacity-70 transition-opacity sm:h-10 sm:max-w-[160px]"
                  />
                );
                return (
                  <li key={partner.id} className="shrink-0">
                    {partner.website_url ? (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        title={partner.name}
                        className="inline-flex min-h-11 items-center hover:[&_img]:opacity-100"
                      >
                        {logo}
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center">{logo}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="shell mt-10 border-t border-white/10 pt-6 text-[12px] uppercase tracking-[0.14em] text-smoke">
          Common Quest, Nantes
        </div>
      </div>
    </footer>
  );
}
