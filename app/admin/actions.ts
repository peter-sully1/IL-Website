"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { IMAGE_BUCKET, MAX_UPLOAD_BYTES } from "@/lib/env";
import { imageUrl } from "@/lib/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";
import { articleInputSchema } from "@/lib/validation";

export type SaveState =
  | { ok?: false; error?: string; fieldErrors?: Partial<Record<string, string>> }
  | undefined;

function revalidateArticle(...slugs: (string | null | undefined)[]) {
  revalidatePath("/articles");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs)) if (slug) revalidatePath(`/articles/${slug}`);
}

export async function saveArticle(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase } = await requireAdmin();

  const parsed = articleInputSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    contentJson: formData.get("contentJson"),
    contentHtml: formData.get("contentHtml"),
    coverImagePath: formData.get("coverImagePath") ?? "",
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Some fields need attention.", fieldErrors };
  }

  const input = parsed.data;

  let contentJson: unknown;
  try {
    contentJson = JSON.parse(input.contentJson);
  } catch {
    return { error: "The article body couldn’t be read. Reload the page and try again." };
  }

  const contentHtml = sanitizeArticleHtml(input.contentHtml);
  if (input.intent === "publish" && !contentHtml.replace(/<[^>]*>/g, "").trim()) {
    return { error: "Write something in the article before publishing it." };
  }

  const slug = input.slug || slugify(input.title);

  // Load the existing row (if editing) to keep its first publish date and old slug.
  let existing: { slug: string; status: string; published_at: string | null } | null = null;
  if (input.id) {
    const { data, error } = await supabase
      .from("articles")
      .select("slug, status, published_at")
      .eq("id", input.id)
      .maybeSingle();
    if (error || !data) return { error: "That article no longer exists." };
    existing = data;
  }

  const status =
    input.intent === "publish" ? "published" : input.intent === "unpublish" ? "draft" : (existing?.status ?? "draft");

  const row = {
    title: input.title,
    slug,
    excerpt: input.excerpt || null,
    content_json: contentJson,
    content_html: contentHtml,
    cover_image_path: input.coverImagePath || null,
    status,
    published_at:
      status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at ?? null,
  };

  const query = input.id
    ? supabase.from("articles").update(row).eq("id", input.id).select("id").single()
    : supabase.from("articles").insert(row).select("id").single();

  const { data, error } = await query;

  if (error) {
    if (error.code === "23505") {
      return { error: "Another article already uses that web address.", fieldErrors: { slug: "Choose a different web address." } };
    }
    console.error("saveArticle failed", error);
    return { error: "The article couldn’t be saved. Try again in a moment." };
  }

  // Refresh the public pages whenever something visible may have changed.
  if (status === "published" || existing?.status === "published") {
    revalidateArticle(slug, existing?.slug);
  }
  revalidatePath("/admin");

  const notice = input.intent === "publish" ? "published" : input.intent === "unpublish" ? "unpublished" : "saved";
  redirect(`/admin/articles/${data.id}/edit?notice=${notice}`);
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin");

  const { data: article } = await supabase
    .from("articles")
    .select("slug, status, cover_image_path")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) {
    console.error("deleteArticle failed", error);
    redirect(`/admin/articles/${id}/edit?notice=delete-failed`);
  }

  if (article?.cover_image_path) {
    await supabase.storage.from(IMAGE_BUCKET).remove([article.cover_image_path]);
  }
  if (article?.status === "published") revalidateArticle(article.slug);
  revalidatePath("/admin");
  redirect("/admin?notice=deleted");
}

export type UploadResult = { ok: true; path: string; url: string } | { ok: false; error: string };

const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "heif", "avif"]);

/**
 * Accepts an image, checks its real contents (not just the file name or the
 * type the browser claims), resizes it, strips metadata such as GPS location,
 * and stores it as WebP.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const { supabase } = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image to upload." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };

  const input = Buffer.from(await file.arrayBuffer());

  let output: Buffer;
  try {
    const image = sharp(input, { limitInputPixels: 50_000_000, animated: false });
    const meta = await image.metadata();
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) {
      return { ok: false, error: "Upload a JPEG, PNG, WebP or GIF image." };
    }
    output = await image
      .rotate() // apply the camera orientation before metadata is dropped
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ok: false, error: "That file isn’t an image that can be used. Try a JPEG or PNG." };
  }

  const path = `${new Date().getFullYear()}/${randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, output, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });

  if (error) {
    console.error("uploadImage failed", error);
    return { ok: false, error: "The image couldn’t be uploaded. Try again in a moment." };
  }

  return { ok: true, path, url: imageUrl(path)! };
}
