import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="inner">
          <Link className="brand" href="/" aria-label="Bait al-Elmi home">
            <span className="ar" lang="ar">بيت العلم</span>
            <span className="en">Bait al-Elmi</span>
          </Link>
          <SiteNav />
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <span className="ar" lang="ar">بيت العلم</span>
        <p>Bait al-Elmi Learning Centre</p>
      </footer>
    </>
  );
}
