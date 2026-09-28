import type { Metadata } from "next";
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

  return (
    <main className="flex flex-1 items-center justify-center bg-stone-100 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">FashionOps</p>
        <h1 className="mt-1 mb-6 text-2xl font-semibold text-stone-900">Studio</h1>
        <LoginForm next={next} initialError={initialError} />
      </div>
    </main>
  );
}
