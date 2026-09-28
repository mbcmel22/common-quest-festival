import ClashAdmin from "@/components/ClashAdmin";

export const dynamic = "force-dynamic";

export default function AdminClashPage() {
  return (
    <div>
      <h1 className="display-l mb-2">Clash Crews Nantais</h1>
      <p className="mb-8 max-w-2xl text-ink/60">
        Régie du samedi soir. Ouvrez la notation du jury, lancez le vote du public avec son
        minuteur, affichez le code de salle sur l’écran, et clôturez quand la manche est jouée.
      </p>
      <ClashAdmin />
    </div>
  );
}
