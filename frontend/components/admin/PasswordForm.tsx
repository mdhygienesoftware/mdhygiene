"use client";

import { FormEvent, useState } from "react";
import { changeAdminPasswordAction } from "@/lib/admin-actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

export default function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Checked here as well as on the server, so a mistyped confirmation is
    // caught before the current password is sent anywhere.
    if (String(data.get("new_password")) !== String(data.get("confirm_password"))) {
      setError("The two new passwords do not match.");
      return;
    }

    setSaving(true);
    setError(null);
    const result = await changeAdminPasswordAction(data);
    if (result.ok) {
      form.reset();
      setDone(true);
    } else {
      setError(result.error ?? "Could not change the password.");
    }
    setSaving(false);
  }

  if (done) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2 max-w-md">
        <h2 className="text-lg font-bold text-navy">Password changed.</h2>
        <p className="text-sm text-muted-2">
          Use the new one next time you sign in. This session stays open — you do not need to
          sign in again now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-4 max-w-md">
      {/* autoComplete hints let a password manager offer to generate and then
          store the new one, which is the whole point: a generated password is
          the practical substitute for the breach check this plan does not have. */}
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Current password
        <input
          type="password"
          name="current_password"
          required
          autoComplete="current-password"
          className="border border-border rounded-lg px-4 py-3 text-sm font-normal"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        New password
        <input
          type="password"
          name="new_password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className="border border-border rounded-lg px-4 py-3 text-sm font-normal"
        />
        <span className="text-xs font-normal text-muted-2">
          At least {MIN_PASSWORD_LENGTH} characters. Use your password manager&apos;s generate
          button rather than thinking one up.
        </span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">
        Confirm new password
        <input
          type="password"
          name="confirm_password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className="border border-border rounded-lg px-4 py-3 text-sm font-normal"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-start bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink transition-colors disabled:opacity-60"
      >
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}
