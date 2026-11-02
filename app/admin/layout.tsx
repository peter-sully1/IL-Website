import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Manage articles",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="inner">
          <nav aria-label="Admin">
            <Link href="/admin">Articles</Link>
            <Link href="/admin/articles/new">New article</Link>
            <Link href="/admin/security">Sign-in security</Link>
            <Link href="/" target="_blank">View website</Link>
          </nav>
          <form action={signOut}>
            <span style={{ marginRight: "1rem", color: "var(--ink-soft)" }}>{user.email}</span>
            <button className="link-button" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
