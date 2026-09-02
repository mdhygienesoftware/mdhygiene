import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import VariantsManager from "@/components/admin/VariantsManager";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const [{ data: product }, { data: brands }, { data: categories }, { data: variants }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("brands").select("*").order("sort_order"),
    supabase.from("product_categories").select("*").order("name"),
    supabase.from("product_variants").select("*").eq("product_id", params.id).order("sort_order"),
  ]);
  if (!product) return notFound();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold text-navy">Edit product — {product.name}</h1>
      <ProductForm
        product={{ ...product, brand: null, category: null, variants: [] }}
        brands={brands ?? []}
        categories={categories ?? []}
      />
      <div className="flex flex-col gap-3 max-w-3xl">
        <h2 className="text-lg font-extrabold text-navy">Sizes &amp; pricing</h2>
        <VariantsManager productId={product.id} variants={variants ?? []} />
      </div>
    </div>
  );
}
