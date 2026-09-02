import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteHeroSlideAction } from "@/lib/admin-actions";
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data: slides } = await supabase.from("hero_slides").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold text-navy">Hero &amp; media</h1>

      <div className="flex flex-col gap-3">
        {(slides ?? []).map((slide) => (
          <div key={slide.id} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-navy">{slide.headline}</p>
              <p className="text-xs text-muted-2">{slide.media_type} · {slide.is_active ? "Active" : "Hidden"} · order {slide.sort_order}</p>
            </div>
            <Link href={`/admin/hero/${slide.id}`} className="text-sm font-semibold text-blue">Edit</Link>
            <form action={deleteHeroSlideAction.bind(null, slide.id)}>
              <button type="submit" className="text-sm font-semibold text-red-600">Delete</button>
            </form>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-navy">Add a new slide</h2>
        <HeroSlideForm />
      </div>
    </div>
  );
}
