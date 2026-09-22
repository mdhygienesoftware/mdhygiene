import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/queries";
import { getSeoGeneral } from "@/lib/seo";
import type { Metadata } from "next";
import { isRenderableImage } from "@/lib/image";

// Rendered once and reused for five minutes, rather than rebuilt from scratch
// on every visit. Admin saves call revalidatePath, so an edit is live at once;
// what this changes is every visit in between.
export const revalidate = 300;

/**
 * Pre-render every brand at build time, so the first visitor to one is served
 * a finished page instead of waiting on a round trip to Supabase. Anything
 * added afterwards is still rendered on demand and cached from then on.
 *
 * An empty list is a valid answer: if Supabase is unreachable during the
 * build, the pages fall back to on-demand rendering rather than failing it.
 */
export async function generateStaticParams() {
    const brands = await getBrands();
  return brands.filter((brand) => brand.slug).map((brand) => ({ slug: String(brand.slug) }));
}

/** Admin overrides win; otherwise fall back to the brand's own name and tagline. */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [brand, general] = await Promise.all([getBrandBySlug(params.slug), getSeoGeneral()]);
  if (!brand) return {};

  const title = brand.meta_title?.trim() || `${brand.name} — sanitary napkins & baby diapers`;
  const description = brand.meta_description?.trim() || brand.tagline || general.default_description;

  return {
    title,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: {
      title,
      description,
      url: `/brands/${brand.slug}`,
      images: brand.logo_url ? [{ url: brand.logo_url }] : undefined,
    },
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const [brand, products] = await Promise.all([
    getBrandBySlug(params.slug),
    getProducts({ brandSlug: params.slug }),
  ]);
  if (!brand) return notFound();

  return (
    <>
      <Header />
      <main>
        <section className="px-5 md:px-14 py-8 md:py-12 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {isRenderableImage(brand.logo_url) && (
            <div className="h-12 md:h-16 flex items-center">
              <Image src={brand.logo_url} alt={brand.name} width={400} height={160} className="max-h-12 md:max-h-16 w-auto max-w-[230px] md:max-w-[300px] object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-3xl md:text-[40px] font-extrabold text-navy">{brand.name}</h1>
            <p className="text-muted-2 mt-1 max-w-xl">{brand.tagline}</p>
          </div>
        </section>
        <ProductShowcase products={products} />
      </main>
      <Footer />
    </>
  );
}
