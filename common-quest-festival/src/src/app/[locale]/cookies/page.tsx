import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Politique de cookies . Common Quest", alternates: alternatesFor(locale, "/cookies") };
}

export default function CookiesPage() {
  return (
    <article className="shell max-w-3xl py-14 md:py-20">
      <h1 className="display-l">Politique de cookies</h1>
      <p className="mt-4 text-[13px] uppercase tracking-[0.16em] text-smoke">
        Conforme à l’article 82 de la loi Informatique et Libertés et aux lignes directrices de la CNIL
      </p>

      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Ce qu’est un cookie</h2>
          <p className="mt-3">
            Un cookie est un petit fichier déposé sur votre appareil lorsque vous visitez un site. Il permet de
            reconnaître votre navigateur d’une page à l’autre, par exemple pour garder votre session ouverte.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Notre choix</h2>
          <p className="mt-3">
            Ce site n’utilise que des cookies strictement nécessaires à son fonctionnement. Aucun traceur
            publicitaire, aucun bouton de partage déposant un cookie tiers, aucune revente de données.
          </p>
          <p className="mt-3">
            Nous mesurons en revanche la fréquentation du site, avec un outil qui ne dépose aucun cookie et n’écrit
            aucun identifiant sur votre appareil. Rien n’étant ni lu ni écrit sur votre terminal, l’article 82 ne
            s’applique pas et aucun consentement ne vous est demandé. Le détail de cette mesure figure plus bas. Le
            bandeau affiché à votre première visite est informatif, pas un formulaire de consentement.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Les cookies déposés</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-4 font-display text-[14px] uppercase tracking-[0.04em] text-acid">Nom</th>
                  <th className="py-2 pr-4 font-display text-[14px] uppercase tracking-[0.04em] text-acid">Rôle</th>
                  <th className="py-2 pr-4 font-display text-[14px] uppercase tracking-[0.04em] text-acid">Durée</th>
                  <th className="py-2 font-display text-[14px] uppercase tracking-[0.04em] text-acid">Émetteur</th>
                </tr>
              </thead>
              <tbody className="align-top">
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-4 font-mono text-[13px]">sb-access-token</td>
                  <td className="py-3 pr-4">Maintient votre session ouverte après connexion</td>
                  <td className="py-3 pr-4">1 heure</td>
                  <td className="py-3">Supabase</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-4 font-mono text-[13px]">sb-refresh-token</td>
                  <td className="py-3 pr-4">Renouvelle la session sans vous redemander votre mot de passe</td>
                  <td className="py-3 pr-4">30 jours</td>
                  <td className="py-3">Supabase</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-4 font-mono text-[13px]">cq_locale</td>
                  <td className="py-3 pr-4">Retient la langue que vous avez choisie</td>
                  <td className="py-3 pr-4">12 mois</td>
                  <td className="py-3">Common Quest</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-mono text-[13px]">cq_cookie_ack</td>
                  <td className="py-3 pr-4">
                    Retient que vous avez lu le bandeau, pour ne pas le réafficher. Stocké dans votre navigateur, pas
                    envoyé à nos serveurs
                  </td>
                  <td className="py-3 pr-4">Jusqu’à effacement</td>
                  <td className="py-3">Common Quest</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] text-smoke">
            Les deux premiers ne sont déposés que si vous créez un compte et vous connectez. En simple visite, seuls
            les deux derniers existent.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Mesure d’audience</h2>
          <p className="mt-3">
            Nous utilisons Vercel Web Analytics pour savoir combien de personnes visitent le site et quelles pages
            sont consultées. Cet outil ne dépose aucun cookie et ne conserve aucun identifiant sur votre appareil.
          </p>
          <p className="mt-3">
            Sont enregistrés : la page consultée, la page d’où vous arrivez, le type d’appareil, le navigateur et le
            pays. Le pays est déduit de votre adresse IP, qui n’est pas conservée. Les visites sont distinguées grâce
            à une empreinte technique recalculée chaque jour, qui ne permet ni de vous suivre d’un jour à l’autre, ni
            de vous reconnaître sur un autre site. Ces données sont agrégées, conservées un an au maximum, et servent
            uniquement à comprendre la fréquentation du festival. Aucun profil publicitaire n’est constitué, aucune
            donnée n’est revendue.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Contenus intégrés</h2>
          <p className="mt-3">
            Certaines pages d’événement affichent des vidéos hébergées par YouTube. Nous utilisons le mode sans
            cookie de ce service : rien n’est déposé tant que vous ne lancez pas la lecture. Si vous lancez une
            vidéo, YouTube peut déposer ses propres cookies, soumis à la politique de Google.
          </p>
          <p className="mt-3">
            Les liens de billetterie et de soutien vous emmènent vers des plateformes externes, qui appliquent leurs
            propres règles dès que vous quittez notre site.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Comment les supprimer</h2>
          <p className="mt-3">
            Vous pouvez effacer les cookies à tout moment depuis les réglages de votre navigateur, rubrique
            confidentialité ou données de navigation. Supprimer les cookies de session vous déconnectera simplement du
            site. Vous pouvez aussi naviguer en fenêtre privée : tout est effacé à la fermeture.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Questions</h2>
          <p className="mt-3">
            Écrivez à associationprism.hello@gmail.com. Vous pouvez également saisir la CNIL, 3 place de Fontenoy,
            75007 Paris, www.cnil.fr.
          </p>
        </section>
      </div>
    </article>
  );
}
