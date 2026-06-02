"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/blogs", label: "Story queue" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/announcements", label: "Announcements" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 border-b border-border pb-4" aria-label="Admin sections">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          pathname.startsWith(`${link.href}/`) ||
          (link.href === "/admin/blogs" && pathname === "/admin");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <a
        href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000"}/admin/`}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-xs font-medium text-muted-foreground hover:text-primary"
      >
        Django Admin ↗
      </a>
    </nav>
  );
}
