export const DEFAULT_SOCIALS = {
  instagram: "https://www.instagram.com/commonquest_",
  tiktok: "https://www.tiktok.com/@common.quest",
  facebook: "https://www.facebook.com/share/19HsLRBsB5/?mibextid=wwXIfr",
  youtube: "",
  linkedin: ""
};

export type Socials = Record<string, string | undefined | null>;

/** Un bloc de reseaux, avec son titre : "Suivez Factor X" par exemple. */
export type SocialGroup = { label: string; links: Socials };

/**
 * Accepte l ancien format, un simple objet de liens, comme le nouveau,
 * une liste de blocs titres. Renvoie toujours une liste de blocs.
 */
export function normalizeSocialGroups(value: unknown): SocialGroup[] {
  if (Array.isArray(value)) {
    const groups = value
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const group = item as { label?: string; links?: Socials };
        return { label: group.label ?? "", links: group.links ?? {} };
      });
    return groups.length > 0 ? groups : [{ label: "", links: {} }];
  }
  if (value && typeof value === "object") {
    const links = value as Socials;
    const hasLink = Object.values(links).some((url) => !!url && String(url).trim().length > 0);
    if (hasLink) return [{ label: "", links }];
  }
  return [{ label: "", links: {} }];
}

/** Ordre d affichage des icones, commun au site et aux fiches evenement. */
export const SOCIAL_KEYS = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
  "spotify",
  "soundcloud",
  "linkedin",
  "website"
] as const;

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  linkedin: "LinkedIn",
  website: "Site web"
};

function Icon({ name }: { name: string }) {
  if (name === "instagram")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "tiktok")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 3h-2.6v12.2a2.6 2.6 0 1 1-2-2.5v-2.7a5.3 5.3 0 1 0 4.6 5.2V9.1c.9.7 2 1.1 3.2 1.2V7.6a3.9 3.9 0 0 1-3.2-3.4V3z" />
      </svg>
    );
  if (name === "youtube")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z" />
      </svg>
    );
  if (name === "spotify")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.1 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.5.3z" />
      </svg>
    );
  if (name === "soundcloud")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M1.2 13.4c-.1 0-.2.1-.2.2l-.2 2 .2 2c0 .1.1.2.2.2s.2-.1.2-.2l.2-2-.2-2c0-.1-.1-.2-.2-.2zm1.6-1.1c-.1 0-.2.1-.2.2l-.3 3.1.3 3c0 .1.1.2.2.2s.2-.1.2-.2l.3-3-.3-3.1c0-.1-.1-.2-.2-.2zm1.7-.6c-.1 0-.2.1-.2.3l-.2 3.6.2 3c0 .2.1.3.2.3.2 0 .3-.1.3-.3l.3-3-.3-3.6c0-.2-.1-.3-.3-.3zm1.8-.4c-.2 0-.3.1-.3.3l-.2 4 .2 3c0 .2.1.3.3.3s.3-.1.3-.3l.3-3-.3-4c0-.2-.1-.3-.3-.3zm1.9-1.1c-.2 0-.3.2-.3.3l-.2 5.1.2 3c0 .2.1.3.3.3s.3-.1.3-.3l.2-3-.2-5.1c0-.2-.1-.3-.3-.3zm2 .5c-.2 0-.4.2-.4.4l-.2 4.5.2 3c0 .2.2.4.4.4s.4-.2.4-.4l.2-3-.2-4.5c0-.2-.2-.4-.4-.4zm2-1.1c-.2 0-.4.2-.4.4l-.2 5.6.2 2.9c0 .2.2.4.4.4s.4-.2.4-.4l.2-2.9-.2-5.6c0-.2-.2-.4-.4-.4zm2.1 5.9v3c0 .2.2.4.4.4s.4-.2.4-.4l.1-2.9-.1-8c0-.2-.2-.4-.4-.4s-.4.2-.4.4l-.1 8v-.1zm2.5-9.4c-.3 0-.5.2-.5.5l-.1 8.9.1 2.8c0 .3.2.5.5.5s.5-.2.5-.5l.1-2.8-.1-8.9c0-.3-.2-.5-.5-.5zm1.7 3.3c-.3 0-.5.2-.5.5l-.1 5.6.1 2.8c0 .3.2.5.5.5s.5-.2.5-.5l.1-2.8-.1-5.6c0-.3-.2-.5-.5-.5zm5.3 3.1c-.4 0-.8.1-1.1.2-.2-2.7-2.5-4.9-5.3-4.9-.7 0-1.3.1-1.9.4-.2.1-.3.2-.3.4v9.4c0 .2.2.4.4.4h8.2c1.7 0 3-1.3 3-3s-1.3-2.9-3-2.9z" />
      </svg>
    );
  if (name === "linkedin")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.9 8.5H3.6V21h3.3V8.5zM5.2 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 21h-3.3v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9V21H10s.1-11.3 0-12.5h3.3v1.8c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21z" />
      </svg>
    );
  if (name === "website")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3z" />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V7c0-.8.3-1.2 1.2-1.2H17V3h-2.6c-2.6 0-3.7 1.4-3.7 3.6v1.9H9V11h1.7v10H14V11h2.3l.4-2.5H14z" />
    </svg>
  );
}

export default function SocialLinks({
  tone = "dark",
  socials,
  withDefaults = true,
  size = "md"
}: {
  tone?: "dark" | "light";
  socials?: Socials | null;
  /** false sur une fiche evenement : on n affiche que ses propres liens. */
  withDefaults?: boolean;
  size?: "md" | "sm";
}) {
  const merged: Socials = withDefaults ? { ...DEFAULT_SOCIALS, ...(socials ?? {}) } : { ...(socials ?? {}) };
  const links = SOCIAL_KEYS.map((key) => ({ key, url: merged[key] })).filter((link) => !!link.url?.trim());
  if (links.length === 0) return null;

  const box = size === "sm" ? "h-10 w-10" : "h-11 w-11";

  return (
    <ul className="flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.url as string}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={SOCIAL_LABELS[link.key]}
            title={SOCIAL_LABELS[link.key]}
            className={`flex ${box} items-center justify-center rounded-full border-2 transition-all duration-200 hover:-translate-y-0.5 ${
              tone === "light"
                ? "border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper"
                : "border-white/25 text-paper hover:border-acid hover:bg-acid hover:text-ink"
            }`}
          >
            <Icon name={link.key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
