import type { Metadata } from "next";
import { cookies } from "next/headers";
import { savedMode, THEME_COOKIE } from "../studio/theme-mode";
import { ThemeToggle } from "../studio/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Studio sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/studio";
  const initialError =
    params.error === "not-admin" ? "This account doesn't have studio access." : undefined;

  // same light/dark choice as the studio
  const theme = savedMode((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <main
      data-studio
      data-theme={theme}
      suppressHydrationWarning
      className="relative flex flex-1 items-center justify-center bg-stone-100 px-4 py-16 text-stone-900"
    >
      <div className="absolute right-4 top-4">
        <ThemeToggle initial={theme} />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">FashionOps</p>
        <h1 className="mt-1 mb-6 text-2xl font-semibold text-stone-900">Studio</h1>
        <LoginForm next={next} initialError={initialError} />
      </div>
    </main>
  );
}
