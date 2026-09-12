import { getAboutContent, getCertifications, getCompanyStats, getContactInfo, getFooterTagline, getSiteVideos } from "@/lib/queries";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

export default async function AdminContentPage() {
  const [stats, contact, about, certifications, footer, videos] = await Promise.all([
    getCompanyStats(),
    getContactInfo(),
    getAboutContent(),
    getCertifications(),
    getFooterTagline(),
    getSiteVideos(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-navy">Site content</h1>
      <SiteSettingsForm stats={stats} contact={contact} about={about} certifications={certifications} footerTagline={footer?.text ?? ""} videos={videos} />
    </div>
  );
}
