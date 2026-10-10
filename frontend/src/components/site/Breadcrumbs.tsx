import Link from "next/link";

export interface Crumb { name: string; path: string }

/** Visible breadcrumb trail (structured data is emitted by the page). Last item is the current page. */
export default function Breadcrumbs({ items, homeLabel = "Home", homeHref = "/" }: { items: Crumb[]; homeLabel?: string; homeHref?: string }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href={homeHref}>{homeLabel}</Link></li>
        {items.map((c, i) => (
          <li key={c.path} {...(i === items.length - 1 ? { "aria-current": "page" as const } : {})}>
            {i === items.length - 1 ? c.name : <Link href={c.path}>{c.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
