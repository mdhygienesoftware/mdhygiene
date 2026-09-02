import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProductAction } from "@/lib/admin-actions";
import { CATALOG_TYPES } from "@/lib/types";

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  catalog_type: string;
  sort_order: number;
  brand: { name: string } | null;
  category: { name: string } | null;
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, is_active, is_featured, catalog_type, sort_order, brand:brands(name), category:product_categories(name)")
    .order("sort_order");

  const products = (data ?? []) as unknown as AdminProductRow[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Products</h1>
        <Link href="/admin/products/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New product
        </Link>
      </div>

      {CATALOG_TYPES.map((type) => {
        const inType = products.filter((p) => p.catalog_type === type.value);
        const brandNames = Array.from(new Set(inType.map((p) => p.brand?.name ?? "Unassigned"))).sort();

        return (
          <section key={type.value} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-extrabold text-navy">{type.label}</h2>
              <span className="text-sm text-muted">{inType.length} product{inType.length === 1 ? "" : "s"}</span>
            </div>

            {inType.length === 0 ? (
              <p className="text-sm text-muted-2 bg-white border border-border rounded-2xl p-5">
                No products in this group yet.
              </p>
            ) : (
              brandNames.map((brandName) => (
                <div key={brandName} className="flex flex-col gap-1.5">
                  <h3 className="text-[13px] font-bold tracking-[0.1em] uppercase text-pink px-1">{brandName}</h3>
                  <div className="bg-white border border-border rounded-2xl overflow-hidden">
                    {inType
                      .filter((p) => (p.brand?.name ?? "Unassigned") === brandName)
                      .map((p) => (
                        <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
                          <div className="flex-1">
                            <p className="font-bold text-navy">{p.name}</p>
                            <p className="text-xs text-muted-2">
                              {p.category?.name ?? "No category"} · {p.is_active ? "Active" : "Hidden"}
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
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}
