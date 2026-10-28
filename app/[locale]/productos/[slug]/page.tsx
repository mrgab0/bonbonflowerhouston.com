import { Suspense } from "react";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Addon } from "@/lib/models/Addon";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { CatalogClient } from "@/components/shop/CatalogClient";
import { filterUniqueVariantProducts } from "@/lib/utils/variantFilter";
import { normalizeAddon } from "@/lib/utils/addonCategories";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ locale?: string; slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;

  // Interceptar ruta virtual /productos/adicionales y mostrar el catálogo filtrado en Adicionales
  if (resolvedParams.slug === "adicionales" || resolvedParams.slug === "addons") {
    const [rawProducts, rawAddons] = await Promise.all([
      Product.find({ isActive: { $ne: false }, isDeleted: { $ne: true } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean(),
      Addon.find({ isActive: { $ne: false }, isDeleted: { $ne: true } })
        .sort({ order: 1, createdAt: 1 })
        .lean(),
    ]);

    const plainProducts = JSON.parse(JSON.stringify(rawProducts || []));
    const products = filterUniqueVariantProducts(plainProducts);
    const addons = (rawAddons || []).filter(Boolean).map(normalizeAddon);

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

  // Consolidar toda la familia de variantes (padre, hermanos e hijos) exclusivamente para la página individual
  const currentIdStr = productDoc._id.toString();
  const variantsMap = new Map<string, any>();

  // 1. Variantes directas del documento (hijos directos si es padre)
  if (Array.isArray(productDoc.variants)) {
    for (const v of productDoc.variants) {
      if (v && v._id && v._id.toString() !== currentIdStr) {
        variantsMap.set(v._id.toString(), {
          _id: v._id,
          name: v.name,
          price: v.price,
          images: v.images,
          slug: v.slug,
          flowerCount: v.flowerCount,
          bouquetType: v.bouquetType,
        });
      }
    }
  }

  // 2. Si este producto es hijo/variante de otro producto (el padre):
  const parentProducts: any[] = await Product.find({
    variants: productDoc._id,
    isActive: { $ne: false },
  })
    .select('name price images slug flowerCount bouquetType variants')
    .populate({ path: 'variants', select: 'name price images slug flowerCount bouquetType' })
    .lean();

  for (const parent of parentProducts) {
    const parentIdStr = parent._id.toString();
    // 2a. Incluir al padre en la lista de opciones
    if (parentIdStr !== currentIdStr && !variantsMap.has(parentIdStr)) {
      variantsMap.set(parentIdStr, {
        _id: parent._id,
        name: parent.name,
        price: parent.price,
        images: parent.images,
        slug: parent.slug,
        flowerCount: parent.flowerCount,
        bouquetType: parent.bouquetType,
      });
    }

    // 2b. Incluir a todos los hermanos (los otros hijos del padre)
    if (Array.isArray(parent.variants)) {
      for (const sibling of parent.variants) {
        if (sibling && sibling._id) {
          const siblingIdStr = sibling._id.toString();
          if (siblingIdStr !== currentIdStr && !variantsMap.has(siblingIdStr)) {
            variantsMap.set(siblingIdStr, {
              _id: sibling._id,
              name: sibling.name,
              price: sibling.price,
              images: sibling.images,
              slug: sibling.slug,
              flowerCount: sibling.flowerCount,
              bouquetType: sibling.bouquetType,
            });
          }
        }
      }
    }
  }

  productDoc.variants = Array.from(variantsMap.values());

  // Convertimos a JSON plano para que React pueda pasarlo a un Client Component
  const product = JSON.parse(JSON.stringify(productDoc));

  return <ProductDetail product={product} />;
}
