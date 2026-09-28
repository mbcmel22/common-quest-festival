import { createClient } from "@/lib/supabase/server";
import ClashJury from "@/components/ClashJury";
import type { ClashRound } from "@/lib/clash";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notation du jury . Clash Crews Nantais",
  robots: { index: false, follow: false }
};

export default async function ClashJuryPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clash_rounds").select("*").order("id");

  return (
    <main className="min-h-screen bg-ink py-10">
      <div className="shell max-w-2xl">
        <ClashJury initial={(data ?? []) as ClashRound[]} />
      </div>
    </main>
  );
}
