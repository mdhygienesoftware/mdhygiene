import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Stats from "@/components/Stats";
import Brands from "@/components/Brands";
import ProductShowcase from "@/components/ProductShowcase";
import PartnerSegments from "@/components/PartnerSegments";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import { getBrands, getCertifications, getCompanyStats, getFeaturedProducts, getHeroSlides } from "@/lib/queries";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [slides, stats, brands, featured, certifications] = await Promise.all([
    getHeroSlides(),
    getCompanyStats(),
    getBrands(),
    getFeaturedProducts(8),
    getCertifications(),
  ]);

  return (
    <>
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
