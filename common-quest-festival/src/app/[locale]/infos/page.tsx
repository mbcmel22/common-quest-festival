import Image from "next/image";
import { getDictionary } from "@/i18n";
import { getTeam, getPartners, getSetting, getDict } from "@/lib/queries";
import Marquee from "@/components/Marquee";
import SocialLinks from "@/components/SocialLinks";
import { pickTicker, type TickerSetting } from "@/lib/ticker";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { alternates: alternatesFor(locale, "/infos") };
}

export default async function InfosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  const [team, partners, practical, ticker, socials] = await Promise.all([
    getTeam(),
    getPartners(),
    getSetting("practical"),
    getSetting<TickerSetting>("ticker"),
    getSetting<Record<string, string>>("socials")
  ]);
  const tickerText = pickTicker(ticker, "infos", locale);

  const roleFor = (member: { role_fr: string | null; role_en: string | null; role_es: string | null }) =>
    locale === "en" ? member.role_en ?? member.role_fr : locale === "es" ? member.role_es ?? member.role_fr : member.role_fr;

  return (
    <>
      <section className="shell pb-10 pt-12 md:pt-16">
        <h1 className="display-xl">{dict.infos.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-paper/75">{dict.infos.intro}</p>
      </section>

      {/* INFOS PRATIQUES */}
      <section className="bg-paper py-16 text-ink md:py-24">
        <div className="shell">
          <h2 className="display-l">{dict.infos.practicalTitle}</h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="eyebrow text-ink/50">{dict.infos.address}</dt>
              <dd className="mt-2 text-lg">{practical?.address ?? "Quartier de la Création, île de Nantes"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-ink/50">{dict.infos.transport}</dt>
              <dd className="mt-2 text-lg">{practical?.transport ?? "Tram 1, arret Chantiers Navals"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-ink/50">{dict.infos.accessibility}</dt>
              <dd className="mt-2 text-lg">{practical?.accessibility ?? "Site accessible, ecrivez-nous pour preparer votre venue"}</dd>
            </div>
            <div>
              <dt className="eyebrow text-ink/50">{dict.infos.contact}</dt>
              <dd className="mt-2 text-lg">
                <a href="mailto:associationprism.hello@gmail.com" className="underline decoration-violet decoration-2 underline-offset-4">
                  associationprism.hello@gmail.com
                </a>
              </dd>
              <dd className="mt-4">
                <SocialLinks tone="light" socials={socials} />
              </dd>
            </div>
          </dl>

          {/* DROIT A L IMAGE : information prealable exigee par le RGPD, a doubler par un affichage sur site. */}
          <div className="mt-12 border-t border-ink/15 pt-8 md:mt-16">
            <h3 className="eyebrow text-ink/50">{dict.infos.imageTitle}</h3>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink/75">{dict.infos.imageText}</p>
          </div>
        </div>
      </section>

      <Marquee text={tickerText} tone="violet" speed={ticker?.speed_infos ?? 75} />

      {/* EQUIPE */}
      <section id="equipe" className="shell scroll-mt-28 py-20 md:py-28">
        <h2 className="display-l">{dict.infos.teamTitle}</h2>
        <p className="mt-6 max-w-2xl text-lg text-paper/75">{dict.infos.teamIntro}</p>

        {team.length > 0 ? (
          <ul className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {team.map((member) => {
              const card = (
                <>
                  <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-transparent bg-ink-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-acid">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        quality={88}
                        sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 230px"
                        className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-4xl text-violet">
                        {member.name.slice(0, 1)}
                      </span>
                    )}

                    {/* Au survol, l enveloppe invite a ecrire directement */}
                    {member.email && (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E7FF36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                          <path d="M3 7l9 6 9-6" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="mt-4 font-display text-xl">{member.name}</p>
                  {member.nickname && (
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-acid">aka {member.nickname}</p>
                  )}
                  <p className="mt-1 text-sm text-smoke">{roleFor(member)}</p>
                </>
              );

              return (
                <li key={member.id} className="group text-center">
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-acid"
                      aria-label={`Écrire à ${member.name}`}
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-10 text-smoke">
            Les membres de l’équipe apparaîtront ici dès qu’ils seront ajoutés dans le back office.
          </p>
        )}
      </section>

      {/* PARTENAIRES */}
      {partners.length > 0 && (
        <section className="border-t border-white/10 py-16">
          <div className="shell">
            <h2 className="display-m">{dict.infos.partnersTitle}</h2>
            <ul className="mt-8 flex flex-wrap items-center gap-8">
              {partners.map((partner) => (
                <li key={partner.id}>
                  {partner.logo_url ? (
                    <a href={partner.website_url ?? "#"} target="_blank" rel="noreferrer noopener">
                      <Image src={partner.logo_url} alt={partner.name} width={120} height={60} className="opacity-70 transition-opacity hover:opacity-100" />
                    </a>
                  ) : (
                    <span className="tag text-paper/70">{partner.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
