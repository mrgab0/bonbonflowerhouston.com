import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import "@/lib/models/Addon"; // Importación con efecto secundario para asegurar registro
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const productDoc: any = await Product.findOne({ slug: resolvedParams.slug }).populate('addons').lean();

  if (!productDoc || productDoc.isActive === false) {
    notFound();
  }

  // Convertimos a JSON plano para que React pueda pasarlo a un Client Component
  const product = JSON.parse(JSON.stringify(productDoc));

  return <ProductDetail product={product} />;
}
