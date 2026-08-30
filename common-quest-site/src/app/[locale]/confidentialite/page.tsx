export const metadata = { title: "Politique de confidentialite . Common Quest" };

export default function PrivacyPage() {
  return (
    <article className="shell max-w-3xl py-16 md:py-24">
      <h1 className="display-l">Politique de confidentialite</h1>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
        Conforme au RGPD, reglement UE 2016/679, et a la loi Informatique et Libertes
      </p>

      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Qui traite vos donnees</h2>
          <p className="mt-3">
            Le responsable de traitement est l association PRISM, 31 avenue Arthur Benoit, 44100 Nantes,
            associationprism.hello@gmail.com.
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Ce que nous collectons</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Creation de compte : adresse email, prenom et nom si vous les renseignez, langue choisie.</li>
            <li>Mot de passe : stocke uniquement sous forme chiffree et irreversible par notre prestataire d authentification. Personne dans l equipe, y compris les administrateurs, ne peut le lire.</li>
            <li>Newsletter : votre email, si et seulement si vous cochez la case correspondante.</li>
            <li>Fonctionnement du site : cookie de session et cookie de langue. Aucun traceur publicitaire, aucun revente de donnees.</li>
          </ul>
        </section>
        <section>
          <h2 className="display-m text-paper">Pourquoi et pour combien de temps</h2>
          <p className="mt-3">
            Les donnees de compte sont conservees tant que le compte existe, puis supprimees dans les 12 mois suivant
            sa fermeture. Les emails de newsletter sont conserves jusqu au desabonnement. La base legale est le
            consentement pour la newsletter et l execution du service pour le compte utilisateur.
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Vos droits</h2>
          <p className="mt-3">
            Vous disposez d un droit d acces, de rectification, d effacement, de limitation, d opposition et de
            portabilite. Ecrivez a associationprism.hello@gmail.com : nous repondons sous un mois. Vous pouvez aussi
            saisir la CNIL, 3 place de Fontenoy, 75007 Paris, www.cnil.fr.
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Sous-traitants</h2>
          <p className="mt-3">
            Vercel pour l hebergement du site et Supabase pour la base de donnees et l authentification, avec un
            stockage en Union europeenne. Les billetteries sont operees par des services tiers avec leurs propres
            politiques : en cliquant sur un lien de billetterie, vous quittez notre site.
          </p>
        </section>
      </div>
    </article>
  );
}
