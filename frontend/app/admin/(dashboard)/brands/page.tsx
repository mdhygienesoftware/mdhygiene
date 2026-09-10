import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { deleteBrandAction } from "@/lib/admin-actions";
import { isRenderableImage } from "@/lib/image";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">Brands</h1>
        <Link href="/admin/brands/new" className="bg-navy text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-pink transition-colors">
          + New brand
        </Link>
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {(brands ?? []).map((brand) => (
          <div key={brand.id} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0">
            {isRenderableImage(brand.logo_url) && <Image src={brand.logo_url} alt={brand.name} width={200} height={80} className="w-20 h-10 object-contain" />}
            <div className="flex-1">
              <p className="font-bold text-navy">{brand.name}</p>
              <p className="text-sm text-muted-2">{brand.tagline}</p>
            </div>
            <Link href={`/admin/brands/${brand.id}`} className="text-sm font-semibold text-blue">Edit</Link>
            <DeleteButton action={deleteBrandAction.bind(null, brand.id)} what={brand.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
