import { Suspense } from "react";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getAddons } from "@/lib/actions/addon";
import { CatalogClient } from "@/components/shop/CatalogClient";
import { filterUniqueVariantProducts } from "@/lib/utils/variantFilter";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: isEn
      ? "Luxury Addons: Teddy Bears, Chocolates & Helium Balloons | Bonbon Flowers Houston"
      : "Adicionales Concierge: Peluches, Chocolates y Globos | Bonbon Flowers Houston",
    description: isEn
      ? "Explore our curated collection of Ferrero Rocher chocolates, plush teddy bears, helium balloons, and golden crowns in Houston, TX."
      : "Descubre nuestra selección de chocolates Ferrero Rocher, tiernos osos de peluche, globos con helio y coronas doradas en Houston, TX.",
  };
}

export default async function LocalizedAdicionalesPage() {
  await dbConnect();
  const rawProducts = await Product.find({ isActive: { $ne: false } })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();
  const plainProducts = JSON.parse(JSON.stringify(rawProducts));
  const products = filterUniqueVariantProducts(plainProducts);

  const addonsRes = await getAddons();
  const addons = addonsRes.success ? addonsRes.data : [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0B0C10] p-12 text-center text-stone-500 dark:text-stone-400">
          Cargando Adicionales...
        </div>
      }
    >
      <CatalogClient initialProducts={products} initialAddons={addons} initialTab="addons" />
    </Suspense>
  );
}
