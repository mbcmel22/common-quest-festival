"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/i18n";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    // Cookie de confort uniquement : aucune donnee personnelle, duree 1 an.
    document.cookie = `cq_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[11px]" role="group" aria-label="Langue">
      {locales.map((code) => (
        <button
          key={code}
          onClick={() => switchTo(code)}
          aria-current={code === locale ? "true" : undefined}
          className={`rounded-full px-2 py-1 transition-colors ${
            code === locale ? "bg-acid text-ink" : "text-smoke hover:text-paper"
          }`}
        >
          {localeLabels[code]}
        </button>
      ))}
    </div>
  );
}
