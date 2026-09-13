import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/fr/admin", "/en/admin", "/es/admin", "/fr/compte", "/en/compte", "/es/compte"] }],
    sitemap: `${base}/sitemap.xml`
  };
}
