import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProductAction } from "@/lib/admin-actions";
import DeleteButton from "@/components/admin/DeleteButton";

type OemProductRow = {
  id: string;
  name: string;
  is_active: boolean;
  is_featured: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
};

export default async function AdminOemPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, is_active, is_featured, brand:brands(name), category:product_categories(name)")
    .eq("catalog_type", "oem")
    .order("sort_order");

  const products = (data ?? []) as unknown as OemProductRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">OEM / Private Label</h1>
          <p className="text-sm text-muted-2 mt-1">
            Lines manufactured under a client&apos;s own brand, kept separate from our four house brands.
          </p>
        </div>
        <Link href="/admin/products/new?type=oem" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New OEM product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-2">
          <p className="font-bold text-navy">No OEM products yet.</p>
          <p className="text-sm text-muted-2">
            Use <span className="font-semibold">+ New OEM product</span> above — anything added from
            this section is filed here instead of under Products.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
              <div className="flex-1">
                <p className="font-bold text-navy">{p.name}</p>
                <p className="text-xs text-muted-2">
                  {p.brand?.name ?? "No brand"} · {p.category?.name ?? "No category"} ·{" "}
                  {p.is_active ? "Active" : "Hidden"}
                  {p.is_featured ? " · Featured" : ""}
                </p>
              </div>
              <Link href={`/admin/products/${p.id}`} className="text-sm font-semibold text-blue">
                Manage
              </Link>
              <DeleteButton action={deleteProductAction.bind(null, p.id)} what={p.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
