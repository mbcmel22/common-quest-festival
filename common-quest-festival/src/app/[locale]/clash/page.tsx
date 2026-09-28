import { createClient } from "@/lib/supabase/server";
import ClashPublicVote from "@/components/ClashPublicVote";
import type { ClashRound } from "@/lib/clash";

// Aucune mise en cache : l ouverture du vote doit etre visible a la seconde.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vote du public . Clash Crews Nantais . Common Quest",
  robots: { index: false, follow: false }
};

export default async function ClashVotePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clash_rounds").select("*").order("id");

  return (
    <main className="min-h-screen bg-ink py-10">
      <div className="shell max-w-lg">
        <p className="eyebrow text-violet">Clash Crews Nantais</p>
        <ClashPublicVote initial={(data ?? []) as ClashRound[]} />
      </div>
    </main>
  );
}
