const links = [
  { name: "Instagram", url: "https://www.instagram.com/commonquest_" },
  { name: "TikTok", url: "https://www.tiktok.com/@common.quest" },
  { name: "Facebook", url: "https://www.facebook.com/share/19HsLRBsB5/?mibextid=wwXIfr" }
];

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
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 8.5V7c0-.8.3-1.2 1.2-1.2H17V3h-2.6c-2.6 0-3.7 1.4-3.7 3.6v1.9H9V11h1.7v10H14V11h2.3l.4-2.5H14z" />
    </svg>
  );
}

export default function SocialLinks({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <ul className="flex items-center gap-3">
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
