import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPublishedArticle, getPublishedArticles, imageUrl } from "@/lib/articles";
import { sanitizeArticleHtml } from "@/lib/sanitize";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article not found" };
  const cover = imageUrl(article.cover_image_path);
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.published_at,
      images: cover ? [cover] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const cover = imageUrl(article.cover_image_path);

  return (
    <article className="wrap">
      <header className="article-head">
        <h1>{article.title}</h1>
        <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
      </header>

      {cover && (
        <figure className="article-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" />
        </figure>
      )}

      {/* Sanitised when saved and again here, so stored HTML is never trusted as-is. */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content_html) }}
      />

      <Link className="back-link" href="/articles">All articles</Link>
      <div style={{ height: "4rem" }} />
    </article>
  );
}
