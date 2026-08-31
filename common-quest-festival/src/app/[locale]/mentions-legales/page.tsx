export const metadata = { title: "Mentions légales . Common Quest" };

export default function LegalPage() {
  return (
    <article className="shell max-w-3xl py-14 md:py-20">
      <h1 className="display-l">Mentions légales</h1>
      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Éditeur du site</h2>
          <p className="mt-3">
            Festival Common Quest, édité par l’association PRISM, association régie par la loi du 1er juillet 1901,
            dont le siège social est situé 31 avenue Arthur Benoit, 44100 Nantes. Directrice de la publication :
            Shirlène Sandemoy, présidente. Contact : associationprism.hello@gmail.com
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Hébergement</h2>
          <p className="mt-3">
            Le site est hébergé par Vercel Inc. La base de données et l’authentification sont assurées par Supabase,
            avec un stockage des données sur des serveurs situés dans l’Union européenne.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Propriété intellectuelle</h2>
          <p className="mt-3">
            L’identité visuelle, les textes, les photographies et l’ensemble des contenus du site sont protégés par le
            droit d’auteur. Toute reproduction, représentation ou adaptation, totale ou partielle, sans autorisation
            écrite préalable est interdite. Les visuels des artistes sont publiés avec leur accord ou celui de leurs
            représentants.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Signaler un contenu</h2>
          <p className="mt-3">
            Pour toute demande de retrait, de correction ou de signalement, écrivez à associationprism.hello@gmail.com.
            Nous répondons dans un délai maximum de trente jours.
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Crédits</h2>
          <p className="mt-3">
            Conception et développement du site : collectif PRISM. Photographies : artistes, photographes et
            partenaires du festival, créditées sur demande.
          </p>
        </section>
      </div>
    </article>
  );
}
