import PasswordForm from "@/components/admin/PasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-navy">Account</h1>
        <p className="text-sm text-muted-2">
          Signed in as <span className="font-semibold text-navy">{user?.email}</span>
        </p>
      </div>

      <PasswordForm />

      <p className="text-xs text-muted-2 max-w-md leading-relaxed">
        Changing the password here does not sign you out. Only one admin session can be
        active at a time, so signing in elsewhere afterwards will end this one.
      </p>
    </div>
  );
}
