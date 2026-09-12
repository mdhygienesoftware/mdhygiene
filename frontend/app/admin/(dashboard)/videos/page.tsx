import { getSiteVideos } from "@/lib/queries";
import VideosForm from "@/components/admin/VideosForm";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getSiteVideos();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Videos</h1>
        <p className="text-sm text-muted-2 mt-1">
          One video band on the homepage and one on the About page. They are separate — set a different
          video for each, or leave either switched off to hide it.
        </p>
      </div>
      <VideosForm videos={videos} />
    </div>
  );
}
