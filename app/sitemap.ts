import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { getPublishedArticles } from "@/lib/articles";

// Regenerated with the article pages, so new articles appear here too.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${SITE_URL}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: articles[0]?.published_at,
    },
    // Add /events and /shop here when they're shown in the menu again.
  ];

  return [
    ...pages,
    ...articles.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.published_at,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
