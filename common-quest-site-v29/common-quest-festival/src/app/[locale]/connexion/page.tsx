import { Suspense } from "react";
import { getDict } from "@/lib/queries";
import { getDictionary, type Locale } from "@/i18n";
import AuthForm from "@/components/AuthForm";

import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Se connecter . Common Quest", alternates: alternatesFor(locale, "/connexion") };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  return (
    <section className="shell max-w-md py-16 md:py-24">
      <h1 className="display-l">{dict.auth.loginTitle}</h1>
      <p className="mt-4 text-paper/70">{dict.auth.loginSubtitle}</p>
      <Suspense fallback={<p className="mt-10 text-smoke">{dict.common.loading}</p>}>
        <AuthForm mode="login" locale={locale as Locale} dict={dict} />
      </Suspense>
    </section>
  );
}
