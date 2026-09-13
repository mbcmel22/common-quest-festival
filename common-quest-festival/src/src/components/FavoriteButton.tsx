"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n";

export default function FavoriteButton({
  eventId,
  locale,
  dict
}: {
  eventId: string;
  locale: string;
  dict: Dictionary;
}) {
  const [status, setStatus] = useState<"loading" | "guest" | "on" | "off">("loading");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setStatus("guest");
      const { data: row } = await supabase
        .from("favorites")
        .select("event_id")
        .eq("event_id", eventId)
        .eq("user_id", data.user.id)
        .maybeSingle();
      setStatus(row ? "on" : "off");
    });
  }, [eventId]);

  async function toggle() {
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return setStatus("guest");

    if (status === "on") {
      setStatus("off");
      await supabase.from("favorites").delete().eq("event_id", eventId).eq("user_id", user.id);
    } else {
      setStatus("on");
      await supabase.from("favorites").insert({ event_id: eventId, user_id: user.id });
    }
  }

  if (status === "loading") return <div className="h-12" aria-hidden />;

  if (status === "guest") {
    return (
      <Link href={`/${locale}/connexion`} className="btn-ghost btn-sm w-full">
        <Heart filled={false} />
        {dict.event.favoriteLogin}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={status === "on"}
      className={`btn-sm w-full ${status === "on" ? "btn-violet" : "btn-ghost"}`}
    >
      <Heart filled={status === "on"} />
      {status === "on" ? dict.event.favoriteRemove : dict.event.favoriteAdd}
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.4l8.8-8.4a5.2 5.2 0 0 0 0-7.4z" />
    </svg>
  );
}
