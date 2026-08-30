import Image from "next/image";
import { getDictionary } from "@/i18n";
import { getTeam, getPartners, getSetting, getDict } from "@/lib/queries";
import Marquee from "@/components/Marquee";
import SocialLinks from "@/components/SocialLinks";
import { pickTicker, type TickerSetting } from "@/lib/ticker";

export const revalidate = 120;

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
  const tickerText = pickTicker(ticker, "infos", locale, dict.home.ticker);

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
        </div>
      </section>

      <Marquee text={tickerText} tone="violet" speed={ticker?.speed_infos ?? 75} />

      {/* EQUIPE */}
      <section id="équipe" className="shell scroll-mt-28 py-20 md:py-28">
        <h2 className="display-l">{dict.infos.teamTitle}</h2>
        <p className="mt-6 max-w-2xl text-lg text-paper/75">{dict.infos.teamIntro}</p>

        {team.length > 0 ? (
          <ul className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {team.map((member) => (
              <li key={member.id} className="group text-center">
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full border-2 border-transparent bg-ink-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-acid">
                  {member.photo_url ? (
                    <Image src={member.photo_url} alt={member.name} fill sizes="180px" className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-4xl text-violet">
                      {member.name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <p className="mt-4 font-display text-xl">{member.name}</p>
                {member.nickname && <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-acid">aka {member.nickname}</p>}
                <p className="mt-1 text-sm text-smoke">{roleFor(member)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-smoke">
            Les membres de l’équipe apparaitront ici des qu’ils seront ajoutes dans le back office.
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
