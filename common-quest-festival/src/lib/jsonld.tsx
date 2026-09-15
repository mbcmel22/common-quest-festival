import type { EventWithTranslation } from "./types";

/**
 * Donnees structurees schema.org.
 *
 * Enjeu principal : rendre le festival eligible aux resultats evenementiels de
 * Google (le bloc "Evenements" qui s affiche sur des requetes comme
 * "festival nantes"). Google exige au minimum name, startDate et location ;
 * offers, image et description ameliorent nettement l affichage.
 */

const TZ = "+02:00"; // Europe/Paris en octobre, heure d ete

const FESTIVAL = {
  nom: "Common Quest",
  debut: "2026-10-01",
  fin: "2026-10-04",
  lieu: "Quartier de la Création",
  rue: "2 allée Frida Kahlo",
  codePostal: "44200",
  ville: "Nantes",
  region: "Pays de la Loire"
};

const ORGANISATEUR = {
  "@type": "Organization",
  name: "PRISM",
  url: "https://www.common-quest.fr",
  email: "associationprism.hello@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "31 avenue Arthur Benoit",
    postalCode: "44100",
    addressLocality: "Nantes",
    addressRegion: "Pays de la Loire",
    addressCountry: "FR"
  }
};

/** Le type schema.org le plus precis possible : Google s en sert pour classer l evenement. */
function typeSchema(categories: string[]): string {
  const c = categories[0] ?? "autre";
  if (c === "danse") return "DanceEvent";
  if (c === "rap" || c === "dj" || c === "soiree" || c === "scene_ouverte") return "MusicEvent";
  if (c === "atelier" || c === "workshop" || c === "talk") return "EducationEvent";
  if (c === "graffiti") return "VisualArtsEvent";
  if (c === "projection") return "ScreeningEvent";
  return "Event";
}

function lieu(event?: EventWithTranslation) {
  const nom = event?.venue?.trim() || FESTIVAL.lieu;
  const rue = event?.address?.trim() || FESTIVAL.rue;
  return {
    "@type": "Place",
    name: nom,
    address: {
      "@type": "PostalAddress",
      streetAddress: rue,
      postalCode: FESTIVAL.codePostal,
      addressLocality: FESTIVAL.ville,
      addressRegion: FESTIVAL.region,
      addressCountry: "FR"
    }
  };
}

/** Assemble une date ISO complete a partir de la date et de l heure saisies en back office. */
function horodatage(date: string, heure: string | null, repli: string): string {
  const h = (heure ?? repli).slice(0, 5);
  return `${date}T${h}:00${TZ}`;
}

function offre(event: EventWithTranslation, url: string) {
  if (event.is_free) {
    return {
      "@type": "Offer",
      price: 0,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: event.ticket_url || url,
      validFrom: "2026-06-01T00:00:00+02:00"
    };
  }
  if (event.price_from == null) return undefined;
  return {
    "@type": "Offer",
    price: event.price_from,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: event.ticket_url || url,
    validFrom: "2026-06-01T00:00:00+02:00"
  };
}

/** Fiche d un evenement du programme. */
export function eventJsonLd(event: EventWithTranslation, locale: string, base: string) {
  const url = `${base}/${locale}/programme/${event.slug}`;
  const categories = Array.isArray(event.categories) && event.categories.length > 0 ? event.categories : [event.category];

  return {
    "@context": "https://schema.org",
    "@type": typeSchema(categories),
    name: event.t?.title ?? event.slug,
    description: event.t?.tagline ?? event.t?.description?.slice(0, 300) ?? undefined,
    startDate: horodatage(event.event_date, event.start_time, "18:00"),
    endDate: event.end_time ? horodatage(event.event_date, event.end_time, "23:00") : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: lieu(event),
    image: event.cover_url ? [event.cover_url] : undefined,
    url,
    isAccessibleForFree: event.is_free,
    inLanguage: locale,
    organizer: ORGANISATEUR,
    superEvent: { "@type": "Festival", name: FESTIVAL.nom, url: `${base}/${locale}` },
    offers: offre(event, url)
  };
}

/** Le festival lui-meme, avec ses evenements en sous-evenements. */
export function festivalJsonLd(events: EventWithTranslation[], locale: string, base: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: FESTIVAL.nom,
    alternateName: "Common Quest Festival",
    description:
      "Festival hip hop pluridisciplinaire à Nantes : battles de danse, concerts rap, DJ sets, workshops, graffiti et rencontres.",
    startDate: `${FESTIVAL.debut}T18:00:00${TZ}`,
    endDate: `${FESTIVAL.fin}T23:00:00${TZ}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: lieu(),
    url: `${base}/${locale}`,
    image: [`${base}/brand/og.jpg`],
    inLanguage: locale,
    organizer: ORGANISATEUR,
    performer: { "@type": "PerformingGroup", name: "Artistes hip hop français et internationaux" },
    subEvent: events.slice(0, 30).map((event) => {
      const url = `${base}/${locale}/programme/${event.slug}`;
      const categories =
        Array.isArray(event.categories) && event.categories.length > 0 ? event.categories : [event.category];
      return {
        "@type": typeSchema(categories),
        name: event.t?.title ?? event.slug,
        startDate: horodatage(event.event_date, event.start_time, "18:00"),
        endDate: event.end_time ? horodatage(event.event_date, event.end_time, "23:00") : undefined,
        location: lieu(event),
        url,
        isAccessibleForFree: event.is_free,
        offers: offre(event, url)
      };
    })
  };
}

/** Identite de l association, pour relier le site a une entite connue de Google. */
export function organisationJsonLd(base: string, socials: Record<string, string> | null) {
  const profils = Object.values(socials ?? {})
    .map((v) => (v ?? "").trim())
    .filter((v) => v.startsWith("http"));

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "PerformingGroup"],
    name: "PRISM",
    alternateName: "Association PRISM Nantes",
    description:
      "Association culturelle nantaise dédiée à la promotion, la valorisation et la transmission de la culture hip hop.",
    url: base,
    email: "associationprism.hello@gmail.com",
    foundingDate: "2025-11-18",
    address: ORGANISATEUR.address,
    areaServed: { "@type": "AdministrativeArea", name: "Pays de la Loire" },
    sameAs: profils.length > 0 ? profils : undefined
  };
}

/** Fil d Ariane : Google l affiche a la place de l URL brute dans les resultats. */
export function ficheArianeJsonLd(base: string, locale: string, items: { nom: string; chemin: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.nom,
      item: `${base}/${locale}${item.chemin}`
    }))
  };
}

/** Balise a inserer dans la page. Le nonce CSP est applique automatiquement par Next. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
