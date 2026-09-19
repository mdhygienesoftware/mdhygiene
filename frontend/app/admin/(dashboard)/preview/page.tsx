import MobilePreview from "@/components/admin/MobilePreview";

export const dynamic = "force-dynamic";

export default function AdminPreviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Mobile preview</h1>
        <p className="text-sm text-muted-2 mt-1">
          The live site at phone width, so you can check how a change looks before anyone else sees it.
        </p>
      </div>
      <MobilePreview />
    </div>
  );
}
