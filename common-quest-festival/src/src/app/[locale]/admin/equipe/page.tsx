import { getDictionary } from "@/i18n";
import TeamEditor from "@/components/TeamEditor";

export default async function AdminTeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return (
    <div>
      <h1 className="display-l mb-8">{dict.admin.team}</h1>
      <TeamEditor dict={dict} />
    </div>
  );
}
