import { Suspense } from "react";
import { getDictionary, type Locale } from "@/i18n";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Creer un compte . Common Quest" };

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
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
