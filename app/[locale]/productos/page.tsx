import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getAddons } from "@/lib/actions/addon";
import { CatalogClient } from "@/components/shop/CatalogClient";
import { filterUniqueVariantProducts } from "@/lib/utils/variantFilter";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LocalizedProductosCatalogPage() {
  await dbConnect();
  const rawProducts = await Product.find({ isActive: { $ne: false } })
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();
  const plainProducts = JSON.parse(JSON.stringify(rawProducts));
  const products = filterUniqueVariantProducts(plainProducts);

  const addonsRes = await getAddons();
  const addons = addonsRes.success ? addonsRes.data : [];

  return <CatalogClient initialProducts={products} initialAddons={addons} />;
}
