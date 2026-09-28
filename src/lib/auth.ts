import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Use at the top of every studio page and server action. Redirects anyone who
 * isn't signed in as an admin. RLS enforces the same rule in the database.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) redirect("/login?error=not-admin");

  return {
    supabase,
    userId: data.claims.sub,
    email: (data.claims.email as string | undefined) ?? null,
  };
}
