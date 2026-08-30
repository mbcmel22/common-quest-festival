import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { locales, defaultLocale } from "@/i18n";

const PUBLIC_FILE = /\.(.*)$/;

function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get("cq_locale")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) return cookieLocale;
  const header = request.headers.get("accept-language") ?? "";
  const preferred = header.split(",").map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return preferred.find((code) => (locales as readonly string[]).includes(code)) ?? defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ces chemins ne doivent jamais recevoir de prefixe de langue :
  // /auth/callback est le point d arrivee des liens de confirmation d email.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. Redirection vers la langue si elle est absente de l URL
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2. Nonce unique par requete pour la Content Security Policy
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://*.supabase.co`,
    `font-src 'self'`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    `frame-src 'self' https://www.google.com https://www.openstreetmap.org`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);

  // 3. Session Supabase rafraichie a chaque navigation
  const { user, supabase } = await updateSession(request, response);

  // 4. Zones protegees
  const locale = pathname.split("/")[1];
  const segments = pathname.replace(`/${locale}`, "");

  if (segments.startsWith("/admin") || segments.startsWith("/compte")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/connexion`;
      url.searchParams.set("suite", pathname);
      return NextResponse.redirect(url);
    }
    if (segments.startsWith("/admin")) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (!profile || !["admin", "editor"].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}`;
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"]
};
