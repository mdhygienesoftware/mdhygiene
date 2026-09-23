import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default async function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: slide } = await supabase.from("hero_slides").select("*").eq("id", id).maybeSingle();
  if (!slide) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">Edit slide — {slide.headline}</h1>
      <HeroSlideForm slide={slide} />
    </div>
  );
}
