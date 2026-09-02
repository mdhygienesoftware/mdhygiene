import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("product_categories").select("*").order("name"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">New product</h1>
      <ProductForm brands={brands ?? []} categories={categories ?? []} />
    </div>
  );
}
