import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [{ count: products }, { count: newInquiries }, { count: pendingOrders }, { count: brands }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("distributor_inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("brands").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Active products", value: products ?? 0, href: "/admin/products" },
    { label: "New inquiries", value: newInquiries ?? 0, href: "/admin/inquiries" },
    { label: "Pending orders", value: pendingOrders ?? 0, href: "/admin/orders" },
    { label: "Brands", value: brands ?? 0, href: "/admin/brands" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold text-navy">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <span className="text-3xl font-extrabold text-navy">{c.value}</span>
            <span className="text-sm text-muted-2">{c.label}</span>
          </Link>
        ))}
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 text-sm text-muted-2 leading-relaxed">
        Manage the product catalog, brands, hero media, editable site copy, distributor inquiries and order
        requests from the sidebar. Public pages read this content live — no redeploy needed.
      </div>
    </div>
  );
}
