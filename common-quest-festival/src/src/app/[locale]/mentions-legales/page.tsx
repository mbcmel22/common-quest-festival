import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Mentions légales . Common Quest", alternates: alternatesFor(locale, "/mentions-legales") };
}

/**
 * A COMPLETER par l association.
 * RNA : numero figurant sur le recepissé de declaration en prefecture, format W44XXXXXXX.
 * SIRET : uniquement si l association en possede un.
 * Laisser la chaine vide masque proprement la mention correspondante.
 */
const NB = "\u00a0";
const RNA = "";
const SIRET = "";

export default function LegalPage() {
  return (
    <article className="shell max-w-3xl py-14 md:py-20">
      <h1 className="display-l">Mentions légales</h1>
      <div className="mt-10 space-y-8 text-paper/80">
        <section>
          <h2 className="display-m text-paper">Éditeur du site</h2>
          <p className="mt-3">
            Festival Common Quest, édité par l’association PRISM, association régie par la loi du 1er juillet 1901,
            dont le siège social est situé 31 avenue Arthur Benoit, 44100 Nantes.
            {RNA ? ` Numéro RNA${NB}: ${RNA}.` : ""}
            {SIRET ? ` Numéro SIRET${NB}: ${SIRET}.` : ""}
            {" "}Directrice de la publication{NB}: Shirlène Sandemoy, présidente.
            Contact{NB}: associationprism.hello@gmail.com
          </p>
        </section>

        <section>
          <h2 className="display-m text-paper">Hébergement</h2>
          <p className="mt-3">
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis,
            téléphone +1{NB}559{NB}288{NB}7060. La base de données et l’authentification sont assurées par
            Supabase Inc., avec un stockage des données sur des serveurs situés dans l’Union européenne.
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
