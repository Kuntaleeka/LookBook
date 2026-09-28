import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only admin routes need the session. Public lookbook pages skip the proxy.
export const config = {
  matcher: ["/studio/:path*", "/login"],
};
