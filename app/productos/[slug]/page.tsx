import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import "@/lib/models/Addon"; // Importación con efecto secundario para asegurar registro
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const productDoc: any = await Product.findOne({ slug: resolvedParams.slug })
    .populate('addons')
    .populate({ path: 'variants', select: 'name price images slug flowerCount bouquetType' })
    .lean();

  if (!productDoc || productDoc.isActive === false) {
    notFound();
  }

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
