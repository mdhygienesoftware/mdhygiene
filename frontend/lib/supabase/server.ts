import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server Component / Server Action client. Reads the visitor's auth cookie so
 * RLS sees them as an admin when they're signed in — no service-role key needed.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // Next's Data Cache would otherwise memoize these GETs indefinitely, so an
    // edit made in /admin wouldn't show on the public site until a redeploy.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component with no response to write to —
          // middleware.ts refreshes the session on every request instead.
        }
      },
    },
  });
}
