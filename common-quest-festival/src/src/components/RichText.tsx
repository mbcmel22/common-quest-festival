import { Fragment } from "react";

/**
 * Affiche un texte libre saisi en back office en rendant cliquables
 * les URL et les adresses e-mail, sans autoriser de HTML.
 * Les retours a la ligne sont conserves.
 */
const PATTERN = /((?:https?:\/\/|www\.)[^\s<>()[\]{}"']+|[^\s<>()[\]{}"',;:]+@[^\s<>()[\]{}"',;:]+\.[a-z]{2,})/gi;

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
              {...(isMail ? {} : { target: "_blank", rel: "noreferrer noopener" })}
              className="underline decoration-acid decoration-2 underline-offset-4 transition-colors hover:text-acid"
            >
              {target.replace(/^https?:\/\//, "")}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </p>
  );
}
