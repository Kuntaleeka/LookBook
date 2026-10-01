import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "./actions";
import { NavLinks } from "./nav-links";
import { savedMode, THEME_COOKIE } from "./theme-mode";
import { ThemeToggle } from "./theme-toggle";

export const metadata: Metadata = {
  title: "Studio · FashionOps",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const { email } = await requireAdmin();
  // the saved light/dark choice; with none, the CSS follows the device setting
  const theme = savedMode((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <div
      data-studio
      data-theme={theme}
      suppressHydrationWarning
      className="flex min-h-full flex-1 flex-col bg-stone-50 text-stone-900 md:flex-row"
    >
      <aside className="flex shrink-0 flex-col gap-6 border-b border-stone-200 bg-white px-4 py-4 md:w-56 md:border-r md:border-b-0 md:py-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">FashionOps</p>
          <p className="text-lg font-semibold">Studio</p>
        </div>
        <NavLinks />
        <ThemeToggle initial={theme} />
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
