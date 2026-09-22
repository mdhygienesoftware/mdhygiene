import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** How long a cached copy of public content may be served before it is refetched. */
export const PUBLIC_REVALIDATE_SECONDS = 300;

/**
 * Read-only client for public content.
 *
 * The difference that matters is what it does *not* do: it never touches
 * cookies. Reading a cookie opts a route out of static rendering for good, so
 * the cookie-backed client made every page on the site render from scratch on
 * every request — a dozen round trips to Supabase for a page of copy that
 * changes when an admin edits it and not otherwise.
 *
 * Responses are cached for five minutes, and admin saves call revalidatePath,
 * so an edit still shows up at once. What changes is the visit that follows:
 * it is served from the cache instead of rebuilding the page.
 *
 * It also sees exactly what a visitor sees. The cookie client showed a
 * signed-in admin rows that RLS hides from everyone else, which is the wrong
 * thing to put in a cache that is then served to the public.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { revalidate: PUBLIC_REVALIDATE_SECONDS } }),
    },
  });
}
