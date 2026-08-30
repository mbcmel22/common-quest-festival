export const metadata = { title: "Mentions légales . Common Quest" };

export default function LegalPage() {
  return (
    <article className="shell max-w-3xl py-16 md:py-24">
      <h1 className="display-l">Mentions légales</h1>
      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Editeur du site</h2>
          <p className="mt-3">
            Festival Common Quest, edite par l’association PRISM (association loi 1901), 31 avenue Arthur Benoit,
            44100 Nantes. Directrice de la publication : Shirlene Sandemoy, presidente.
            Contact : associationprism.hello@gmail.com
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Hebergement</h2>
          <p className="mt-3">
            Site heberge par Vercel Inc. Base de donnees et authentification par Supabase, avec stockage des donnees
            sur des serveurs situés dans l'Union europeenne.
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Propriété intellectuelle</h2>
          <p className="mt-3">
            L'identite visuelle, les textes, les photographies et les contenus du site sont protégés. Toute
            reproduction sans autorisation ecrite préalable est interdite. Les visuels des artistes sont publiés avec
            leur accord ou celui de leurs représentants.
          </p>
        </section>
        <section>
          <h2 className="display-m text-paper">Signaler un contenu</h2>
          <p className="mt-3">
            Pour toute demande de retrait, de correction ou de signalement, écrivez à associationprism.hello@gmail.com.
            Nous repondons sous 30 jours au plus tard.
          </p>
        </section>
      </div>
    </article>
  );
}
