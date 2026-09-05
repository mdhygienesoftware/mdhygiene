import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminSignOutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/oem", label: "OEM / Private Label" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/hero", label: "Hero & Media" },
  { href: "/admin/content", label: "Site Content" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // middleware.ts already redirects unauthenticated visitors; this guards the
  // (rare) case of a signed-in-but-not-admin auth user.
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("admin_profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    // Fixed-height shell: the sidebar stays put and only the content pane scrolls.
    <div className="h-screen overflow-hidden flex bg-cream">
      <aside className="w-60 shrink-0 bg-navy text-white flex flex-col gap-1 p-5 h-full overflow-y-auto">
        <span className="font-extrabold text-lg mb-6">MDHygiene Admin</span>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="px-3 py-2 rounded-lg text-sm font-medium text-[#C3D6E7] hover:bg-white/10 hover:text-white transition-colors">
            {item.label}
          </Link>
        ))}
        <form action={adminSignOutAction} className="mt-auto pt-6">
          <button type="submit" className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#C3D6E7] hover:bg-white/10 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
