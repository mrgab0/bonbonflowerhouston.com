import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Addon } from "@/lib/models/Addon";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const [productDocRaw, globalAddons] = await Promise.all([
    Product.findOne({ slug: resolvedParams.slug })
      .populate('addons')
      .populate({ path: 'variants', select: 'name price images slug flowerCount bouquetType' })
      .lean(),
    Addon.find({ isActive: { $ne: false }, isDeleted: { $ne: true } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ]);

  const productDoc: any = productDocRaw;

  if (!productDoc || productDoc.isActive === false || productDoc.isDeleted === true) {
    notFound();
  }

  // Garantizar que todos los adicionales activos (Ferrero, peluches, globos) estén disponibles en todos los productos
  if (!productDoc.addons || productDoc.addons.length === 0) {
    productDoc.addons = globalAddons;
  } else {
    const existingIds = new Set(productDoc.addons.map((a: any) => a._id?.toString() || a.toString()));
    const missing = (globalAddons || []).filter((a: any) => !existingIds.has(a._id?.toString()));
    productDoc.addons = [...productDoc.addons, ...missing];
  }

  // Convertimos a JSON plano para que React pueda pasarlo a un Client Component
  const product = JSON.parse(JSON.stringify(productDoc));

  return <ProductDetail product={product} />;
}
