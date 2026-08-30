import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LANGS: Record<string, string> = { fr: "francais", en: "anglais", es: "espagnol" };

/**
 * Traduction automatique des textes du site.
 * Reservee aux administrateurs. Necessite la variable d environnement ANTHROPIC_API_KEY.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non autorise" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["admin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "non autorise" }, { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Traduction automatique indisponible : la cle ANTHROPIC_API_KEY n’est pas configuree sur Vercel." },
      { status: 501 }
    );
  }

  const body = (await request.json()) as { text?: string; source?: string; targets?: string[] };
  const text = (body.text ?? "").slice(0, 2000).trim();
  const source = LANGS[body.source ?? "fr"] ?? "francais";
  const targets = (body.targets ?? []).filter((code) => code in LANGS).slice(0, 2);
  if (!text || targets.length === 0) return NextResponse.json({ error: "requete incomplete" }, { status: 400 });

  const instruction =
    `Traduis ce texte de ${source} vers ${targets.map((code) => LANGS[code]).join(" et ")}. ` +
    `Contexte : site d’un festival hip hop. Garde le ton, la ponctuation et les noms propres. ` +
    `Reponds uniquement par un objet JSON dont les cles sont ${targets.map((c) => `"${c}"`).join(" et ")}.\n\n${text}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 700,
        messages: [{ role: "user", content: instruction }]
      })
    });
    if (!response.ok) return NextResponse.json({ error: "service de traduction indisponible" }, { status: 502 });

    const data = await response.json();
    const raw = (data.content ?? [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("")
      .replace(/```json|```/g, "")
      .trim();
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "traduction impossible" }, { status: 502 });
  }
}
