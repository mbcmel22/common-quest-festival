"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n";

type Practical = { address: string; transport: string; accessibility: string; instagram: string };

export default function SettingsEditor({ dict }: { dict: Dictionary }) {
  const [value, setValue] = useState<Practical>({ address: "", transport: "", accessibility: "", instagram: "" });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "practical")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setValue({ address: "", transport: "", accessibility: "", instagram: "", ...data.value });
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({ key: "practical", value }, { onConflict: "key" });
    setState(error ? "error" : "saved");
  }

  const fields: { key: keyof Practical; label: string }[] = [
    { key: "address", label: "Adresse du festival" },
    { key: "transport", label: "Comment venir" },
    { key: "accessibility", label: "Accessibilite" },
    { key: "instagram", label: "Lien Instagram" }
  ];

  return (
    <form onSubmit={save} className="max-w-xl space-y-4 rounded-2xl border border-ink/12 bg-white p-6">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="label" htmlFor={field.key}>
            {field.label}
          </label>
          <input
            id={field.key}
            className="field-light"
            value={value[field.key]}
            onChange={(e) => setValue((v) => ({ ...v, [field.key]: e.target.value }))}
            maxLength={200}
          />
        </div>
      ))}
      <button type="submit" className="btn-ink" disabled={state === "saving"}>
        {state === "saving" ? dict.admin.saving : dict.admin.save}
      </button>
      {state === "saved" && <span className="ml-4 text-sm text-violet">{dict.admin.saved}</span>}
      {state === "error" && <span className="ml-4 text-sm text-red-600">{dict.common.error}</span>}
    </form>
  );
}
