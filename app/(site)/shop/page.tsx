import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <>
      <PageIntro title="Shop" arabic="المتجر" />
      <div className="empty">
        <div className="wrap">
          <p>Books and learning materials will be available here soon.</p>
          <Link className="btn" href="/about#classes">Browse classes in the meantime</Link>
        </div>
      </div>
    </>
  );
}
