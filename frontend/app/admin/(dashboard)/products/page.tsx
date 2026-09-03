import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProductAction } from "@/lib/admin-actions";
import { CATALOG_TYPES } from "@/lib/types";
import type { Brand } from "@/lib/types";

type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  catalog_type: string;
  sort_order: number;
  brand_id: string | null;
  category: { name: string } | null;
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data: brandData }, { data: productData }] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, slug, is_active, is_featured, catalog_type, sort_order, brand_id, category:product_categories(name)")
      .order("sort_order"),
  ]);

  const brands = (brandData ?? []) as Brand[];
  const products = (productData ?? []) as unknown as AdminProductRow[];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Products</h1>
        <Link href="/admin/products/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New product
        </Link>
      </div>

      {CATALOG_TYPES.map((type) => {
        const inType = products.filter((p) => p.catalog_type === type.value);
        const unassigned = inType.filter((p) => !p.brand_id);

        return (
          <section key={type.value} className="flex flex-col gap-5">
            <div className="flex items-baseline gap-3 border-b border-border pb-2">
              <h2 className="text-lg font-extrabold text-navy">{type.label}</h2>
              <span className="text-sm text-muted">
                {inType.length} product{inType.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* One block per brand, so each of the four brands stays visually distinct */}
            {brands.map((brand) => (
              <BrandBlock
                key={brand.id}
                brand={brand}
                products={inType.filter((p) => p.brand_id === brand.id)}
              />
            ))}

            {unassigned.length > 0 && <BrandBlock brand={null} products={unassigned} />}
          </section>
        );
      })}
    </div>
  );
}

function BrandBlock({ brand, products }: { brand: Brand | null; products: AdminProductRow[] }) {
  const accent = brand?.accent_color ?? "#8A7B73";

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border" style={{ borderLeft: `4px solid ${accent}` }}>
        {brand?.logo_url ? (
          <Image src={brand.logo_url} alt={brand.name} width={96} height={40} className="h-10 w-auto object-contain" />
        ) : (
          <span className="h-10 flex items-center font-extrabold text-navy">{brand?.name ?? "Unassigned"}</span>
        )}
        <div className="flex-1">
          <p className="font-extrabold text-navy leading-tight">{brand?.name ?? "Unassigned"}</p>
          <p className="text-xs text-muted-2">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="px-6 py-4 text-sm text-muted-2">No products under this brand yet.</p>
      ) : (
        products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-border last:border-0">
            <div className="flex-1">
              <p className="font-bold text-navy">{p.name}</p>
              <p className="text-xs text-muted-2">
                {p.category?.name ?? "No category"} · {p.is_active ? "Active" : "Hidden"}
                {p.is_featured ? " · Featured" : ""}
              </p>
            </div>
            <Link href={`/admin/products/${p.id}`} className="text-sm font-semibold text-blue">
              Manage
            </Link>
            <form action={deleteProductAction.bind(null, p.id)}>
              <button type="submit" className="text-sm font-semibold text-red-600">
                Delete
              </button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
