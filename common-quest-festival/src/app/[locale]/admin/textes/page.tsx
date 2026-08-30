import { getDictionary } from "@/i18n";
import CopyEditor from "@/components/CopyEditor";

export default async function AdminCopyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return (
    <div>
      <h1 className="display-l mb-8">Textes du site</h1>
      <CopyEditor dict={dict} />
    </div>
  );
}
