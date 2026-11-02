import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { IMAGE_BUCKET, SUPABASE_URL } from "@/lib/env";

export type PublicArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_image_path: string | null;
  published_at: string;
};

export function imageUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

export async function getPublishedArticles() {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, cover_image_path, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Could not load articles: ${error.message}`);
  return data as Omit<PublicArticle, "content_html">[];
}

export async function getPublishedArticle(slug: string) {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, content_html, cover_image_path, published_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Could not load article: ${error.message}`);
  return data as PublicArticle | null;
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(iso));
}
