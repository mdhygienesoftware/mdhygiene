import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteHeroSlideAction } from "@/lib/admin-actions";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const supabase = await createClient();
  const { data: slides } = await supabase.from("hero_slides").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Hero &amp; media</h1>
        <p className="text-sm text-muted-2 mt-1">
          Slides run in order and loop. <span className="font-semibold">Display time</span> sets how long
          each one stays on screen before the next.
        </p>
      </div>

      {/* Ratio guidance, worked out from what the hero box actually measures
          rather than from a style guide: it runs from 0.65:1 on a phone to
          3.1:1 on a wide monitor, and the media is object-cover, so the same
          file is cropped very differently at each end. */}
      <section className="bg-white border border-border rounded-2xl p-6 md:p-7 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold text-navy">Picture and video guidelines</h2>
          <p className="text-sm text-muted-2">
            The hero is not one fixed shape — it is wide on a computer and tall on a phone, and your
            media is cropped to fill it. These are the sizes that survive both.
          </p>
        </div>

        <dl className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <Guide term="Use 16:9">
            The safe ratio for both pictures and video. <span className="font-semibold">1920 × 1080</span>{" "}
            is the size to aim for; 1600 × 900 is the minimum before it starts to look soft on a large
            screen.
          </Guide>
          <Guide term="Keep the subject centred">
            The hero is about <span className="font-semibold">3:1</span> on a wide monitor and about{" "}
            <span className="font-semibold">2:3 — taller than it is wide</span> — on a phone. The sides
            are cut off on a phone and the top and bottom on a monitor, so anything within a fifth of any
            edge will be lost to someone.
          </Guide>
          <Guide term="Leave the left third clear">
            On a computer the words sit over a frosted panel across the left third of the picture. On a
            phone they sit on the photo itself over a dark fade at the bottom, so avoid pictures that are
            bright or busy down there.
          </Guide>
          <Guide term="Video">
            Same 16:9, MP4, WebM or MOV, up to 50 MB. It plays muted and loops, so it carries no sound.
            Add a poster image at the same ratio — that is what shows while the video loads.
          </Guide>
        </dl>

        <p className="text-xs text-muted-2">
          The preview under the form shows the slide as it will appear, so you can check the crop before
          saving.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {(slides ?? []).map((slide) => (
          <div key={slide.id} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4">
            {/* Plain <img>: shows whatever is stored, including a URL not yet
                imported, which next/image would reject. */}
            {slide.media_url && slide.media_type !== "video" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.media_url}
                alt=""
                className="w-28 h-16 rounded-lg object-cover border border-border shrink-0 bg-[#F5E1EA]"
              />
            )}
            {slide.media_url && slide.media_type === "video" && (
              <video src={slide.media_url} muted className="w-28 h-16 rounded-lg object-cover border border-border shrink-0 bg-black" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-navy">{slide.headline}</p>
              <p className="text-xs text-muted-2">
                {slide.media_type} · {slide.is_active ? "Active" : "Hidden"} · order {slide.sort_order}
              </p>
              <p className="text-xs font-semibold text-blue mt-0.5">
                Display time: {slide.duration_seconds}s
              </p>
            </div>
            <Link href={`/admin/hero/${slide.id}`} className="text-sm font-semibold text-blue">Edit</Link>
            <DeleteButton action={deleteHeroSlideAction.bind(null, slide.id)} what={slide.headline} />
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

function Guide({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[12px] font-bold tracking-[0.1em] text-pink uppercase">{term}</dt>
      <dd className="text-sm leading-relaxed text-muted-2">{children}</dd>
    </div>
  );
}
