export const metadata = { title: "Politique de confidentialité . Common Quest" };

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
