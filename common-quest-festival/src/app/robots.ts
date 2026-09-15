import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.common-quest.fr";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [
          "/fr/admin", "/en/admin", "/es/admin",
          "/fr/compte", "/en/compte", "/es/compte",
          "/fr/connexion", "/en/connexion", "/es/connexion",
          "/fr/inscription", "/en/inscription", "/es/inscription",
          "/api/"
        ] }],
    sitemap: `${base}/sitemap.xml`
  };
}
