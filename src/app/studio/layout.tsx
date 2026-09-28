import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Studio · FashionOps",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/studio", label: "Inbox", ready: true },
  { href: "#", label: "Categories", ready: false },
  { href: "#", label: "Sorted outfits", ready: false },
];

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const { email } = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-stone-50 text-stone-900 md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-stone-200 bg-white px-4 py-4 md:w-56 md:border-r md:border-b-0 md:py-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">FashionOps</p>
          <p className="text-lg font-semibold">Studio</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-stone-100"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                title="Coming in a later phase"
                className="rounded-lg px-3 py-2 text-sm whitespace-nowrap text-stone-400"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 text-xs text-stone-500 md:flex">
          <Link href="/" className="hover:text-stone-900">
            View lookbook ↗
          </Link>
          {email && <span className="truncate">{email}</span>}
          <form action={signOut}>
            <button type="submit" className="hover:text-stone-900">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
