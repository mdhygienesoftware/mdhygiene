import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BrandProductsAccordion, { type AccordionProduct } from "@/components/admin/BrandProductsAccordion";
import type { Brand } from "@/lib/types";

type ProductRow = {
  id: string;
  name: string;
  brand_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  category: { name: string } | null;
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data: brandData }, { data: productData }] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("id, name, brand_id, is_active, is_featured, category:product_categories(name)")
      .eq("catalog_type", "own_brand")
      .order("sort_order"),
  ]);

  const brands = (brandData ?? []) as Brand[];
  const products: AccordionProduct[] = ((productData ?? []) as unknown as ProductRow[]).map((p) => ({
    id: p.id,
    name: p.name,
    brand_id: p.brand_id,
    is_active: p.is_active,
    is_featured: p.is_featured,
    category_name: p.category?.name ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Products</h1>
          <p className="text-sm text-muted-2 mt-1">Select a brand to see its products.</p>
        </div>
        <Link href="/admin/products/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New product
        </Link>
      </div>

      <BrandProductsAccordion brands={brands} products={products} />
    </div>
  );
}
