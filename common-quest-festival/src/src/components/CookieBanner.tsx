"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale, Dictionary } from "@/i18n";

export default function CookieBanner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(window.localStorage.getItem("cq_cookie_ack") !== "1");
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/15 bg-ink-soft/95 p-4 backdrop-blur sm:inset-x-auto sm:left-5 sm:max-w-md">
      <p className="text-sm text-paper/85">{dict.cookies.text}</p>
      <div className="mt-3 flex items-center gap-4">
        <button
          className="btn-acid"
          onClick={() => {
            window.localStorage.setItem("cq_cookie_ack", "1");
            setShow(false);
          }}
        >
          {dict.cookies.accept}
        </button>
        <Link href={`/${locale}/cookies`} className="text-[12px] font-medium uppercase tracking-[0.14em] text-smoke hover:text-paper">
          {dict.cookies.more}
        </Link>
      </div>
    </div>
  );
}
