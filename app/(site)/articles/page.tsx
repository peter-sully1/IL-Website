import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { formatDate, getPublishedArticles, imageUrl } from "@/lib/articles";

export const metadata: Metadata = { title: "Articles" };

// Rebuilt on demand when an article is published (revalidatePath), with an
// hourly fallback in case a revalidation is ever missed.
export const revalidate = 3600;

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <>
      <PageIntro title="Articles" arabic="مقالات" />
      <div className="wrap">
        {articles.length === 0 ? (
          <div className="empty">
            <p>Articles from the centre will be published here soon.</p>
            <Link className="btn" href="/about#classes">Browse classes in the meantime</Link>
          </div>
        ) : (
          <ul className="article-list">
            {articles.map((a) => {
              const cover = imageUrl(a.cover_image_path);
              return (
                <li key={a.id} className={`article-card${cover ? " has-image" : ""}`}>
                  {cover && (
                    <Link href={`/articles/${a.slug}`} tabIndex={-1} aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt="" loading="lazy" />
                    </Link>
                  )}
                  <div>
                    <h2>
                      <Link href={`/articles/${a.slug}`}>{a.title}</Link>
                    </h2>
                    <time dateTime={a.published_at}>{formatDate(a.published_at)}</time>
                    {a.excerpt && <p>{a.excerpt}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
