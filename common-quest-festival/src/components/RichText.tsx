import { Fragment } from "react";

/**
 * Affiche un texte libre saisi en back office en rendant cliquables
 * les URL et les adresses e-mail, sans autoriser de HTML.
 * Les retours a la ligne sont conserves.
 */
const PATTERN = /((?:https?:\/\/|www\.)[^\s<>()[\]{}"']+|[^\s<>()[\]{}"',;:]+@[^\s<>()[\]{}"',;:]+\.[a-z]{2,})/gi;

/**
 * Une URL de formulaire peut depasser 90 caracteres sans espace ni tiret :
 * sans point de coupure, elle sort de la colonne. On raccourcit l affichage
 * par le milieu, le lien complet reste dans href et dans title.
 */
const MAX_AFFICHE = 52;
function raccourcir(url: string): string {
  if (url.length <= MAX_AFFICHE) return url;
  return `${url.slice(0, 34)}…${url.slice(-10)}`;
}

// La ponctuation finale ne doit pas etre avalee par le lien.
function splitTrailing(raw: string): [string, string] {
  const m = raw.match(/[.,;:!?»)\]]+$/);
  if (!m) return [raw, ""];
  return [raw.slice(0, raw.length - m[0].length), m[0]];
}

export default function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(PATTERN);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;

        const [target, trailing] = splitTrailing(part);
        const isMail = target.includes("@") && !target.startsWith("http") && !target.startsWith("www.");
        const href = isMail ? `mailto:${target}` : target.startsWith("http") ? target : `https://${target}`;

        return (
          <Fragment key={index}>
            <a
              href={href}
              title={target}
              {...(isMail ? {} : { target: "_blank", rel: "noreferrer noopener" })}
              className="text-acid underline decoration-acid/50 decoration-2 underline-offset-4 transition-colors [overflow-wrap:anywhere] hover:decoration-acid"
            >
              {raccourcir(target.replace(/^https?:\/\//, ""))}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </p>
  );
}
