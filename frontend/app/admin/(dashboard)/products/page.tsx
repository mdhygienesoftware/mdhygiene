import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProductAction } from "@/lib/admin-actions";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, brand:brands(name)")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Products</h1>
        <Link href="/admin/products/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New product
        </Link>
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {(products ?? []).map((p) => (
          <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
            <div className="flex-1">
              <p className="font-bold text-navy">{p.name}</p>
              <p className="text-xs text-muted-2">
                {(p.brand as { name: string } | null)?.name ?? "No brand"} · {p.is_active ? "Active" : "Hidden"}
                {p.is_featured ? " · Featured" : ""}
              </p>
            </div>
            <Link href={`/admin/products/${p.id}`} className="text-sm font-semibold text-blue">Manage</Link>
            <form action={deleteProductAction.bind(null, p.id)}>
              <button type="submit" className="text-sm font-semibold text-red-600">Delete</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
