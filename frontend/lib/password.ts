/**
 * Password rules, in a plain module rather than beside the action that applies
 * them.
 *
 * `lib/admin-actions.ts` is a "use server" file, and such a file may export
 * nothing but async functions — a bare constant there fails the build. The
 * client form needs this number too, so it lives somewhere both can import.
 */

/** Enforced on the server as well as in the form, which can be bypassed. */
export const MIN_PASSWORD_LENGTH = 12;
