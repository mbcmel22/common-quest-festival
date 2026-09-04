import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Politique de confidentialité . Common Quest", alternates: alternatesFor(locale, "/confidentialite") };
}

export default function PrivacyPage() {
  return (
    <article className="shell max-w-3xl py-14 md:py-20">
      <h1 className="display-l">Politique de confidentialité</h1>
      <p className="mt-4 text-[13px] uppercase tracking-[0.16em] text-smoke">
        Conforme au RGPD, règlement UE 2016/679, et à la loi Informatique et Libertés
      </p>

      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Qui traite vos données</h2>
          <p className="mt-3">
            Le responsable de traitement est l’association PRISM, 31 avenue Arthur Benoit, 44100 Nantes,
            associationprism.hello@gmail.com.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Ce que nous collectons</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Création de compte : adresse électronique, prénom et nom si vous les renseignez, langue choisie.
            </li>
            <li>
              Mot de passe : stocké uniquement sous forme chiffrée et irréversible par notre prestataire
              d’authentification. Personne dans l’équipe, y compris les administrateurs, ne peut le lire.
            </li>
            <li>Favoris : la liste des événements que vous enregistrez, visible de vous seul.</li>
            <li>
              Lettre d’information : votre adresse électronique, si et seulement si vous cochez la case
              correspondante.
            </li>
            <li>
              Fonctionnement du site : un cookie de session et un cookie de langue. Aucun traceur publicitaire, aucune
              revente de données.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="display-m text-paper">Pourquoi et pour combien de temps</h2>
          <p className="mt-3">
            Les données de compte sont conservées tant que le compte existe, puis supprimées dans les douze mois
            suivant sa fermeture. Les adresses inscrites à la lettre d’information sont conservées jusqu’au
            désabonnement. La base légale est le consentement pour la lettre d’information et l’exécution du service
            pour le compte utilisateur.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Vos droits</h2>
          <p className="mt-3">
            Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de
            portabilité de vos données. Écrivez à associationprism.hello@gmail.com : nous répondons sous un mois. Vous
            pouvez également saisir la CNIL, 3 place de Fontenoy, 75007 Paris, www.cnil.fr.
          </p>
          <p className="mt-3">
            Vous pouvez également définir des directives relatives au sort de vos données après votre décès,
            conformément à l’article 85 de la loi Informatique et Libertés.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Sous-traitants</h2>
          <p className="mt-3">
            Vercel pour l’hébergement du site et Supabase pour la base de données et l’authentification, avec un
            stockage en Union européenne. Les billetteries et les dons sont opérés par des services tiers disposant de
            leurs propres politiques de confidentialité : en cliquant sur un lien de billetterie ou de soutien, vous
            quittez notre site.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Transferts hors Union européenne</h2>
          <p className="mt-3">
            L’hébergement du site est assuré par Vercel Inc., société établie aux États-Unis. Des données techniques
            comme votre adresse IP et les journaux de connexion peuvent être traitées hors de l’Union européenne. Ces
            transferts sont encadrés par les clauses contractuelles types adoptées par la Commission européenne. Les
            données de compte et les contenus du site sont stockés sur des serveurs situés dans l’Union européenne.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Sécurité</h2>
          <p className="mt-3">
            Les échanges avec le site sont chiffrés de bout en bout (HTTPS). Les mots de passe ne sont jamais stockés
            en clair. L’accès à l’espace d’administration est réservé aux membres habilités de l’association et
            contrôlé au niveau de la base de données elle-même, et non seulement dans l’interface. En cas de violation
            de données susceptible d’engendrer un risque pour vos droits, nous vous en informerions et notifierions la
            CNIL dans les délais prévus par le règlement.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Délégué à la protection des données</h2>
          <p className="mt-3">
            Compte tenu de la taille de l’association et de la nature des traitements réalisés, PRISM n’est pas tenue
            de désigner un délégué à la protection des données. Vos demandes sont traitées directement par la
            présidence, à l’adresse associationprism.hello@gmail.com.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Cookies</h2>
          <p className="mt-3">
            Le détail des cookies déposés, leur rôle et leur durée de conservation figurent sur la page dédiée
            Politique de cookies, accessible depuis le pied de page.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Vidéos intégrées</h2>
          <p className="mt-3">
            Les vidéos présentes sur les pages d’événement sont intégrées via le mode sans cookie de YouTube. Aucune
            donnée n’est transmise tant que vous ne lancez pas la lecture.
          </p>
        </section>
      </div>
    </article>
  );
}
