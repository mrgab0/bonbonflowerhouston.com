import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Addon } from "@/lib/models/Addon";
import { notFound, redirect } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { normalizeAddon } from "@/lib/utils/addonCategories";

export default async function ProductPage({ params }: { params: Promise<{ slug: string; locale?: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const [productDocRaw, globalAddons] = await Promise.all([
    Product.findOne({ slug: resolvedParams.slug })
      .populate('addons')
      .lean(),
    Addon.find({ isActive: { $ne: false }, isDeleted: { $ne: true } })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
  ]);

  const productDoc: any = productDocRaw;

  if (!productDoc || productDoc.isActive === false || productDoc.isDeleted === true) {
    notFound();
  }

  // Si el producto solicitado es una variante secundaria (hijo), redirigir al padre
  const parentProduct: any = await Product.findOne({
    variants: productDoc._id,
    isActive: { $ne: false },
  }).select('slug').lean();

  if (parentProduct && parentProduct.slug && parentProduct.slug !== resolvedParams.slug) {
    const localePrefix = resolvedParams.locale ? `/${resolvedParams.locale}` : '';
    redirect(`${localePrefix}/productos/${parentProduct.slug}`);
  }

  // Garantizar que todos los adicionales activos (Ferrero, peluches, globos) estén disponibles en todos los productos
  if (!productDoc.addons || productDoc.addons.length === 0) {
    productDoc.addons = globalAddons;
  } else {
    const existingIds = new Set(
      (productDoc.addons || [])
        .filter(Boolean)
        .map((a: any) => (a._id ? a._id.toString() : a.toString()))
    );
    const missing = (globalAddons || []).filter(
      (a: any) => a && !existingIds.has(a._id ? a._id.toString() : a.toString())
    );
    productDoc.addons = [...productDoc.addons, ...missing];
  }
  productDoc.addons = (productDoc.addons || []).filter(Boolean).map(normalizeAddon);

  // No renderizar variantes en la vista individual del producto
  productDoc.variants = [];

  // Convertimos a JSON plano para que React pueda pasarlo a un Client Component
  const product = JSON.parse(JSON.stringify(productDoc));

  return <ProductDetail product={product} />;
}
