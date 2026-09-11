import { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Recalcular sitemap cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowersforyou.com";

  // Rutas estáticas de la tienda
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Rutas dinámicas de productos desde MongoDB
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    await dbConnect();
    const products = await Product.find({}, "slug updatedAt").lean();
    
    productRoutes = products.map((prod: any) => ({
      url: `${baseUrl}/productos/${prod.slug}`,
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error al generar sitemap dinámico desde MongoDB:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
