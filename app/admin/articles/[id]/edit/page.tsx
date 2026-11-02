import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { requireAdmin } from "@/lib/auth";
import { imageUrl } from "@/lib/articles";
import { ArticleForm } from "@/components/ArticleForm";
import { DeleteArticleButton } from "@/components/DeleteArticleButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

const notices: Record<string, { text: string; tone: "success" | "error" }> = {
  saved: { text: "Changes saved.", tone: "success" },
  published: { text: "Published. The article is now live on the website.", tone: "success" },
  unpublished: { text: "Unpublished. The article is hidden from the website and kept as a draft.", tone: "success" },
  "delete-failed": { text: "The article couldn’t be deleted. Try again in a moment.", tone: "error" },
};

export default async function EditArticlePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { notice } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { supabase } = await requireAdmin();
  const { data: article } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, content_json, cover_image_path, status")
    .eq("id", id)
    .maybeSingle();
  if (!article) notFound();

  const n = notice ? notices[notice] : undefined;

  return (
    <>
      <div className="admin-head">
        <h1>Edit article</h1>
        {article.status === "published" && (
          <Link href={`/articles/${article.slug}`} target="_blank">View on website</Link>
        )}
      </div>

      {n && (
        <p className={`notice ${n.tone}`} role={n.tone === "error" ? "alert" : "status"}>{n.text}</p>
      )}

      <ArticleForm
        key={`${article.id}-${notice ?? ""}`}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          contentJson: article.content_json as JSONContent,
          coverImagePath: article.cover_image_path ?? "",
          coverImageUrl: imageUrl(article.cover_image_path),
          status: article.status as "draft" | "published",
        }}
      />

      <h2>Delete</h2>
      <p>Deleting removes the article and its cover image permanently.</p>
      <DeleteArticleButton id={article.id} />
    </>
  );
}
