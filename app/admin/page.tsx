import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const { notice } = await searchParams;

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, updated_at")
    .order("updated_at", { ascending: false });

  const fmt = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeZone: "Australia/Brisbane" });

  return (
    <>
      <div className="admin-head">
        <h1>Articles</h1>
        <Link className="btn primary" href="/admin/articles/new">Write a new article</Link>
      </div>

      {notice === "deleted" && <p className="notice success" role="status">Article deleted.</p>}
      {error && <p className="notice error" role="alert">Articles couldn’t be loaded. Refresh the page to try again.</p>}

      {articles && articles.length === 0 && (
        <div className="notice">
          <p style={{ margin: 0 }}>
            No articles yet. <Link href="/admin/articles/new">Write the first one</Link>.
          </p>
        </div>
      )}

      {articles && articles.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Last edited</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/articles/${a.id}/edit`}>{a.title}</Link>
                  </td>
                  <td>
                    <span className={`status ${a.status}`}>
                      {a.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{fmt.format(new Date(a.updated_at))}</td>
                  <td>
                    {a.status === "published" && (
                      <Link href={`/articles/${a.slug}`} target="_blank">View</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
