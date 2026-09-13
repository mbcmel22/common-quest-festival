import { getDictionary } from "@/i18n";
import PartnersEditor from "@/components/PartnersEditor";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return (
    <div>
      <h1 className="display-l mb-2">{dict.admin.partners}</h1>
      <p className="mb-8 max-w-2xl text-ink/60">
        Les logos ajoutés ici apparaissent dans le bandeau en bas de toutes les pages du site.
      </p>
      <PartnersEditor />
    </div>
  );
}
