"use client";

import { FormEvent, useState } from "react";
import { adminSignInAction } from "@/lib/actions";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await adminSignInAction(new FormData(e.currentTarget));
    // A successful sign-in redirects server-side and never returns here.
    if (result && !result.ok) {
      setError(result.error ?? "Sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-10 w-full max-w-sm flex flex-col gap-4 shadow-sm">
        <h1 className="text-2xl font-extrabold text-navy">Admin sign in</h1>
        <p className="text-sm text-muted-2">M.D. Hygiene content &amp; order management.</p>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Email
          <input name="email" type="email" required className="border border-border rounded-lg px-4 py-3 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
          Password
          <input name="password" type="password" required className="border border-border rounded-lg px-4 py-3 font-normal" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
