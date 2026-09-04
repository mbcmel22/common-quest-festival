import { Suspense } from "react";
import { getDict } from "@/lib/queries";
import { getDictionary, type Locale } from "@/i18n";
import AuthForm from "@/components/AuthForm";

import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: "Créer un compte . Common Quest", alternates: alternatesFor(locale, "/inscription") };
}

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDict(locale);
  return (
    <section className="shell max-w-md py-16 md:py-24">
      <h1 className="display-l">{dict.auth.signupTitle}</h1>
      <p className="mt-4 text-paper/70">{dict.auth.signupSubtitle}</p>
      <Suspense fallback={<p className="mt-10 text-smoke">{dict.common.loading}</p>}>
        <AuthForm mode="signup" locale={locale as Locale} dict={dict} />
      </Suspense>
    </section>
  );
}
