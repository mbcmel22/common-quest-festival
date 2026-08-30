"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./ImageUploader";
import type { TeamMember } from "@/lib/types";
import type { Dictionary } from "@/i18n";

const blank = (): Partial<TeamMember> => ({
  name: "",
  nickname: "",
  role_fr: "",
  role_en: "",
  role_es: "",
  photo_url: null,
  instagram_url: "",
  sort_order: 0,
  is_published: true
});

export default function TeamEditor({ dict }: { dict: Dictionary }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [draft, setDraft] = useState<Partial<TeamMember>>(blank());
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("team_members").select("*").order("sort_order");
    setMembers((data ?? []) as TeamMember[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name?.trim()) return;
    setState("saving");
    const supabase = createClient();
    const payload = { ...draft, sort_order: Number(draft.sort_order ?? 0) };
    const { error } = draft.id
      ? await supabase.from("team_members").update(payload).eq("id", draft.id)
      : await supabase.from("team_members").insert(payload);
    if (error) return setState("error");
    setDraft(blank());
    setState("idle");
    load();
  }

  async function remove(id: string) {
    if (!window.confirm(dict.admin.confirmDelete)) return;
    const supabase = createClient();
    await supabase.from("team_members").delete().eq("id", id);
    load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={save} className="h-max rounded-2xl border border-ink/12 bg-white p-6 space-y-4">
        <h2 className="display-m">{draft.id ? dict.admin.edit : "Ajouter un membre"}</h2>
        <ImageUploader label="Photo" value={draft.photo_url ?? null} folder="equipe" onChange={(url) => setDraft((d) => ({ ...d, photo_url: url }))} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="m-name">Prenom et nom</label>
            <input id="m-name" className="field-light" value={draft.name ?? ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} maxLength={80} required />
          </div>
          <div>
            <label className="label" htmlFor="m-nick">Surnom</label>
            <input id="m-nick" className="field-light" value={draft.nickname ?? ""} onChange={(e) => setDraft((d) => ({ ...d, nickname: e.target.value }))} maxLength={40} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="m-role-fr">Role, francais</label>
          <input id="m-role-fr" className="field-light" value={draft.role_fr ?? ""} onChange={(e) => setDraft((d) => ({ ...d, role_fr: e.target.value }))} maxLength={80} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="m-role-en">Role, anglais</label>
            <input id="m-role-en" className="field-light" value={draft.role_en ?? ""} onChange={(e) => setDraft((d) => ({ ...d, role_en: e.target.value }))} maxLength={80} />
          </div>
          <div>
            <label className="label" htmlFor="m-role-es">Role, espagnol</label>
            <input id="m-role-es" className="field-light" value={draft.role_es ?? ""} onChange={(e) => setDraft((d) => ({ ...d, role_es: e.target.value }))} maxLength={80} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="m-insta">Instagram</label>
            <input id="m-insta" type="url" className="field-light" value={draft.instagram_url ?? ""} onChange={(e) => setDraft((d) => ({ ...d, instagram_url: e.target.value }))} />
          </div>
          <div>
            <label className="label" htmlFor="m-order">Ordre</label>
            <input id="m-order" type="number" className="field-light" value={draft.sort_order ?? 0} onChange={(e) => setDraft((d) => ({ ...d, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={draft.is_published ?? true} onChange={(e) => setDraft((d) => ({ ...d, is_published: e.target.checked }))} className="h-4 w-4 accent-[#7E1AFF]" />
          Visible sur le site
        </label>
        <div className="flex items-center gap-4">
          <button type="submit" className="btn-ink" disabled={state === "saving"}>
            {state === "saving" ? dict.admin.saving : dict.admin.save}
          </button>
          {draft.id && (
            <button type="button" onClick={() => setDraft(blank())} className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
              Annuler
            </button>
          )}
          {state === "error" && <span className="text-sm text-red-600">{dict.common.error}</span>}
        </div>
      </form>

      <ul className="divide-y divide-ink/10 rounded-2xl border border-ink/12 bg-white">
        {loading && <li className="p-6 text-ink/50">{dict.common.loading}</li>}
        {!loading && members.length === 0 && <li className="p-6 text-ink/50">Aucun membre pour le moment.</li>}
        {members.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-ink/10">
                {member.photo_url && <img src={member.photo_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div>
                <p className="font-display text-lg">{member.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">{member.role_fr}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDraft(member)} className="btn-ink">{dict.admin.edit}</button>
              <button onClick={() => remove(member.id)} className="font-mono text-[11px] uppercase tracking-[0.14em] text-red-600">
                {dict.admin.delete}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
