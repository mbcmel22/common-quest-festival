"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n";

export default function AccountForm({
  dict,
  initialName,
  initialNewsletter,
  email
}: {
  dict: Dictionary;
  initialName: string;
  initialNewsletter: boolean;
  email: string;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return setState("error");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, newsletter_opt_in: newsletter })
      .eq("id", user.id);
    setState(error ? "error" : "saved");
  }

  return (
    <form onSubmit={save} className="mt-10 space-y-5">
      <div>
        <span className="label">{dict.auth.email}</span>
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-smoke">{email}</p>
      </div>
      <div>
        <label className="label" htmlFor="name">
          {dict.auth.fullName}
        </label>
        <input id="name" className="field" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} />
      </div>
      <label className="flex items-start gap-3 text-sm text-paper/80">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} className="mt-1 h-4 w-4 accent-[#E7FF36]" />
        {dict.auth.newsletter}
      </label>
      <button type="submit" className="btn-acid" disabled={state === "saving"}>
        {state === "saving" ? dict.admin.saving : dict.account.save}
      </button>
      {state === "saved" && <p role="status" className="text-sm text-acid">{dict.account.saved}</p>}
      {state === "error" && <p role="alert" className="text-sm text-red-400">{dict.common.error}</p>}
    </form>
  );
}
