"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n";

const names: Record<Locale, string> = { fr: "Francais", en: "English", es: "Espanol" };
const codes: Record<Locale, string> = { fr: "FR", en: "EN", es: "ES" };

function Flag({ code }: { code: Locale }) {
  if (code === "fr")
    return (
      <svg width="20" height="14" viewBox="0 0 3 2" aria-hidden className="rounded-[2px]">
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#fff" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
      </svg>
    );
  if (code === "es")
    return (
      <svg width="20" height="14" viewBox="0 0 3 2" aria-hidden className="rounded-[2px]">
        <rect width="3" height="2" fill="#AA151B" />
        <rect width="3" height="1" y="0.5" fill="#F1BF00" />
      </svg>
    );
  return (
    <svg width="20" height="14" viewBox="0 0 60 40" aria-hidden className="rounded-[2px]">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0l60 40M60 0L0 40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0v40M0 20h60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  );
}

export default function LanguageSwitcher({ locale, tone = "dark" }: { locale: Locale; tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function switchTo(next: Locale) {
    document.cookie = `cq_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.split("/").slice(2).join("/");
    setOpen(false);
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
    router.refresh();
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Langue : ${names[locale]}`}
        className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 font-display text-[14px] uppercase leading-none tracking-[0.05em] transition-colors ${
          tone === "light" ? "border-ink/20 text-ink hover:border-ink" : "border-white/25 text-paper hover:border-acid hover:text-acid"
        }`}
      >
        <Flag code={locale} />
        {codes[locale]}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={open ? "rotate-180 transition-transform" : "transition-transform"}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-2xl border border-white/15 bg-ink-soft py-1 shadow-xl"
        >
          {locales.map((code) => (
            <li key={code}>
              <button
                role="option"
                aria-selected={code === locale}
                onClick={() => switchTo(code)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors hover:bg-white/10 ${
                  code === locale ? "text-acid" : "text-paper"
                }`}
              >
                <Flag code={code} />
                {names[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
