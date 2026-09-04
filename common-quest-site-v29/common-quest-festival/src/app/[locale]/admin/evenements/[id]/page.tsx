import { getDictionary, type Locale } from "@/i18n";
import EventEditor from "@/components/EventEditor";

export default async function AdminEventPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const dict = getDictionary(locale);
  return (
    <div>
      <h1 className="display-l mb-8">{id === "nouveau" ? dict.admin.newEvent : dict.admin.edit}</h1>
      <EventEditor eventId={id} locale={locale as Locale} dict={dict} />
    </div>
  );
}
