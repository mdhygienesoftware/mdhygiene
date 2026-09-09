import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Single-session enforcement.
 *
 * Supabase's built-in "single session per user" is a Pro-plan feature and this
 * project is on Free, so it is enforced here instead: each sign-in records its
 * session id on the admin's row, and every admin request checks that the caller
 * still holds it.
 */

/** Reads the `session_id` claim out of the access token without verifying it —
 *  the token has already been validated by getUser() before this is called. */
export function sessionIdFromToken(accessToken: string | undefined): string | null {
  if (!accessToken) return null;
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return null;
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const claims = JSON.parse(json) as { session_id?: string };
    return claims.session_id ?? null;
  } catch {
    return null;
  }
}

/** Records this session as the active one, displacing any other device. */
export async function claimSession(supabase: SupabaseClient, userId: string, sessionId: string) {
  await supabase
    .from("admin_profiles")
    .update({ active_session_id: sessionId, session_started_at: new Date().toISOString() })
    .eq("id", userId);
}

/**
 * True when this request may proceed.
 *
 * Deliberately permissive in two cases so a mistake here can never lock the only
 * admin out: an unreadable session id, and a row that has no active session yet
 * (which the caller then claims).
 */
export async function sessionIsCurrent(
  supabase: SupabaseClient,
  userId: string,
  accessToken: string | undefined,
  storedSessionId: string | null
): Promise<boolean> {
  const current = sessionIdFromToken(accessToken);
  if (!current) return true;

  if (!storedSessionId) {
    await claimSession(supabase, userId, current);
    return true;
  }
  return storedSessionId === current;
}
