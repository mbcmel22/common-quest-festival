import type { Metadata } from "next";
import { Anton, Inter_Tight, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDictionary, isLocale, locales, type Locale } from "@/i18n";
import { getSessionContext, getSetting, getDict, getTypeScale } from "@/lib/queries";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollToTop from "@/components/ScrollToTop";
import CookieBanner from "@/components/CookieBanner";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Inter_Tight({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDict(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", es: "/es" }
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
      locale,
      siteName: "Common Quest",
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "Common Quest, festival hip hop, 1 au 4 octobre 2026 a Nantes" }]
    },
    twitter: { card: "summary_large_image", images: ["/brand/og.png"] },
    robots: { index: true, follow: true }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDict(locale);
  const { user, isAdmin } = await getSessionContext();
  const brand = await getSetting<{ logo_url?: string }>("brand");
  const typeScale = await getTypeScale();
  const socials = await getSetting<Record<string, string>>("socials");

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen" style={{ "--type-scale": typeScale } as React.CSSProperties}>
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-acid focus:px-5 focus:py-2 focus:text-ink"
        >
          Aller au contenu
        </a>
        <SiteHeader locale={locale as Locale} dict={dict} userEmail={user?.email ?? null} isAdmin={isAdmin} logoUrl={brand?.logo_url ?? null} />
        <main id="contenu" className="pt-32 md:pt-44">
          {children}
        </main>
        <SiteFooter locale={locale as Locale} dict={dict} logoUrl={brand?.logo_url ?? null} socials={socials} />
        <ScrollToTop label={dict.common.backToTop} />
        <CookieBanner locale={locale as Locale} dict={dict} />
      </body>
    </html>
  );
}
