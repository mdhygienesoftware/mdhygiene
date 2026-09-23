import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BrandForm from "@/components/admin/BrandForm";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: brand } = await supabase.from("brands").select("*").eq("id", id).maybeSingle();
  if (!brand) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">Edit brand — {brand.name}</h1>
      <BrandForm brand={brand} />
    </div>
  );
}
