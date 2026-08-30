export const DEFAULT_SOCIALS = {
  instagram: "https://www.instagram.com/commonquest_",
  tiktok: "https://www.tiktok.com/@common.quest",
  facebook: "https://www.facebook.com/share/19HsLRBsB5/?mibextid=wwXIfr",
  youtube: "",
  linkedin: ""
};

export type Socials = Partial<typeof DEFAULT_SOCIALS>;

function Icon({ name }: { name: string }) {
  if (name === "Instagram")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  if (name === "TikTok")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 3h-2.6v12.2a2.6 2.6 0 1 1-2-2.5v-2.7a5.3 5.3 0 1 0 4.6 5.2V9.1c.9.7 2 1.1 3.2 1.2V7.6a3.9 3.9 0 0 1-3.2-3.4V3z" />
      </svg>
    );
  if (name === "YouTube")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2-5.2 3.2z" />
      </svg>
    );
  if (name === "LinkedIn")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6.9 8.5H3.6V21h3.3V8.5zM5.2 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 21h-3.3v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.8 1.3-.1.2-.1.6-.1.9V21H10s.1-11.3 0-12.5h3.3v1.8c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21z" />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V7c0-.8.3-1.2 1.2-1.2H17V3h-2.6c-2.6 0-3.7 1.4-3.7 3.6v1.9H9V11h1.7v10H14V11h2.3l.4-2.5H14z" />
    </svg>
  );
}

export default function SocialLinks({ tone = "dark", socials }: { tone?: "dark" | "light"; socials?: Socials | null }) {
  const merged = { ...DEFAULT_SOCIALS, ...(socials ?? {}) };
  const links = [
    { name: "Instagram", url: merged.instagram },
    { name: "TikTok", url: merged.tiktok },
    { name: "Facebook", url: merged.facebook },
    { name: "YouTube", url: merged.youtube },
    { name: "LinkedIn", url: merged.linkedin }
  ].filter((link) => !!link.url?.trim());

  return (
    <ul className="flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={link.name}
            title={link.name}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-200 hover:-translate-y-0.5 ${
              tone === "light"
                ? "border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper"
                : "border-white/25 text-paper hover:border-acid hover:bg-acid hover:text-ink"
            }`}
          >
            <Icon name={link.name} />
          </a>
        </li>
      ))}
    </ul>
  );
}
