"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/studio", label: "Outfits", ready: true },
  { href: "/studio/categories", label: "Categories", ready: true },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {NAV.map((item) => {
        if (!item.ready) {
          return (
            <span
              key={item.label}
              title="Coming in a later phase"
              className="rounded-lg px-3 py-2 text-sm whitespace-nowrap text-stone-400"
            >
              {item.label}
            </span>
          );
        }
        const active =
          item.href === "/studio" ? pathname === "/studio" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
              active ? "bg-stone-900 text-white" : "hover:bg-stone-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
