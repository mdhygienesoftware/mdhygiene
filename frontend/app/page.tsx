import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Stats from "@/components/Stats";
import Brands from "@/components/Brands";
import ProductShowcase from "@/components/ProductShowcase";
import PartnerSegments from "@/components/PartnerSegments";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import { getBrands, getCertifications, getCompanyStats, getContactInfo, getFeaturedProducts, getHeroSlides } from "@/lib/queries";
import { getSeoAi, getSeoGeneral, getSeoLocal, resolveSiteUrl } from "@/lib/seo";
import StructuredData, { faqSchema, localBusinessSchema, organizationSchema } from "@/components/StructuredData";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [slides, stats, brands, featured, certifications, contact, general, local, ai] = await Promise.all([
    getHeroSlides(),
    getCompanyStats(),
    getBrands(),
    getFeaturedProducts(8),
    getCertifications(),
    getContactInfo(),
    getSeoGeneral(),
    getSeoLocal(),
    getSeoAi(),
  ]);

  const siteUrl = resolveSiteUrl(general.canonical_domain);
  const contactBits = { phones: contact?.phones, email: contact?.email };
  const faq = faqSchema(ai);

  return (
    <>
      <StructuredData data={organizationSchema(general, local, siteUrl, contactBits)} />
      <StructuredData data={localBusinessSchema(local, siteUrl, contactBits)} />
      {faq && <StructuredData data={faq} />}
      <Header />
      <main>
        <HeroCarousel slides={slides} />
        <Stats stats={stats} />
        <Brands brands={brands} />
        <ProductShowcase products={featured} title="Featured products" />
        <PartnerSegments />
        <Certifications certifications={certifications ?? []} />
      </main>
      <Footer />
    </>
  );
}
