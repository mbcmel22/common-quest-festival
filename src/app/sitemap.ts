import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getEvents } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const events = await getEvents("fr");
  const staticPaths = ["", "/programme", "/infos", "/mentions-legales", "/confidentialite", "/cookies"];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    staticPaths.forEach((path) =>
      entries.push({ url: `${base}/${locale}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 })
    );
    events.forEach((event) =>
      entries.push({ url: `${base}/${locale}/programme/${event.slug}`, changeFrequency: "weekly", priority: 0.6 })
    );
  }
  return entries;
}
