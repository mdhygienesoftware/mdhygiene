import { getSiteGalleries } from "@/lib/queries";
import GalleryForm from "@/components/admin/GalleryForm";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const galleries = await getSiteGalleries();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Gallery</h1>
        <p className="text-sm text-muted-2 mt-1">
          One image carousel on the homepage and one on the About page. They are separate — use different
          pictures for each, or leave either switched off to hide it.
        </p>
      </div>
      <GalleryForm galleries={galleries} />
    </div>
  );
}
