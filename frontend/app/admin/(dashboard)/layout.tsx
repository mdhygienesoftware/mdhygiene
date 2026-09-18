import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminSignOutAction } from "@/lib/actions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { sessionIsCurrent } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/visitors", label: "Visitors" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/oem", label: "OEM / Private Label" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/hero", label: "Hero & Media" },
  { href: "/admin/content", label: "Site Content" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/careers", label: "Careers" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/seo", label: "SEO & GEO" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware.ts already redirects unauthenticated visitors; this guards the
  // (rare) case of a signed-in-but-not-admin auth user.
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, active_session_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  // Single session: a newer sign-in elsewhere displaces this one. Checked from
  // the same row already fetched above, so it costs no extra round trip.
  const { data: sessionData } = await supabase.auth.getSession();
  const ok = await sessionIsCurrent(
    supabase,
    user.id,
    sessionData.session?.access_token,
    profile.active_session_id,
  );
  if (!ok) {
    await supabase.auth.signOut();
    redirect("/admin/login?reason=session-superseded");
  }

  return (
    // Fixed-height shell: the sidebar stays put and only the content pane scrolls.
    // On mobile the rail becomes a drawer, with a 14px top bar taking its place.
    <div className="h-screen overflow-hidden flex bg-cream">
      <AdminSidebar
        nav={NAV}
        signOut={
          <form action={adminSignOutAction}>
            <button type="submit" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#C3D6E7] hover:bg-white/10 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        }
      />
      <main className="flex-1 h-full overflow-y-auto pt-14 md:pt-0">
        <div className="p-4 md:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
