"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/about#classes", label: "Classes" },
  { href: "/articles", label: "Articles" },
  { href: "/events", label: "Events" },
  { href: "/shop", label: "Shop" },
];

export function SiteNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) => {
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <nav className="site-nav" aria-label="Main">
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
