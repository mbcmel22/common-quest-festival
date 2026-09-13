import { getDictionary } from "@/i18n";
import SettingsEditor from "@/components/SettingsEditor";

export default async function AdminSettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return (
    <div>
      <h1 className="display-l mb-8">{dict.admin.settings}</h1>
      <SettingsEditor dict={dict} />
    </div>
  );
}
