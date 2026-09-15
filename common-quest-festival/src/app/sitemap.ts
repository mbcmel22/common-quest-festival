import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getEvents } from "@/lib/queries";

export const revalidate = 3600;

/**
 * Le sitemap declare les equivalents de langue de chaque URL (hreflang).
 * Sans cela, Google traite les trois versions comme des pages concurrentes
 * et n en retient souvent qu une seule.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.common-quest.fr";
  const events = await getEvents("fr");
  const maj = new Date();

  const pages: { chemin: string; priorite: number; frequence: "daily" | "weekly" | "monthly" }[] = [
    { chemin: "", priorite: 1, frequence: "daily" },
    { chemin: "/programme", priorite: 0.9, frequence: "daily" },
    { chemin: "/infos", priorite: 0.8, frequence: "weekly" },
    { chemin: "/mentions-legales", priorite: 0.2, frequence: "monthly" },
    { chemin: "/confidentialite", priorite: 0.2, frequence: "monthly" },
    { chemin: "/cookies", priorite: 0.2, frequence: "monthly" }
  ];

  events.forEach((event) => pages.push({ chemin: `/programme/${event.slug}`, priorite: 0.8, frequence: "weekly" }));

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${base}/${locale}${page.chemin}`,
        lastModified: maj,
        changeFrequency: page.frequence,
        priority: page.priorite,
        alternates: {
          languages: Object.fromEntries([
            ...locales.map((l) => [l, `${base}/${l}${page.chemin}`]),
            ["x-default", `${base}/fr${page.chemin}`]
          ])
        }
      });
    }
  }
  return entries;
}
