import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductShowcase from "@/components/ProductShowcase";
import { getBrandBySlug, getProducts } from "@/lib/queries";
import { getSeoGeneral } from "@/lib/seo";
import type { Metadata } from "next";

// Always render against current data — admin edits must show up immediately.
export const dynamic = "force-dynamic";

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
  const brand = await getBrandBySlug(params.slug);
  if (!brand) return notFound();
  const products = await getProducts({ brandSlug: params.slug });

  return (
    <>
      <Header />
      <main>
        <section className="px-6 md:px-14 py-14 flex items-center gap-6">
          {brand.logo_url && (
            <div className="h-16">
              <Image src={brand.logo_url} alt={brand.name} width={160} height={64} className="h-16 w-auto object-contain" />
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
