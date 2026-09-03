import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { catalogTypeLabel } from "@/lib/types";

export default async function NewProductPage({ searchParams }: { searchParams: { type?: string } }) {
  const supabase = await createClient();
  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("product_categories").select("*").order("name"),
  ]);

  // Opened from the OEM section (?type=oem) or from Products (default).
  const catalogType = searchParams.type === "oem" ? "oem" : "own_brand";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">
        New product — {catalogTypeLabel(catalogType)}
      </h1>
      <ProductForm brands={brands ?? []} categories={categories ?? []} defaultCatalogType={catalogType} />
    </div>
  );
}
