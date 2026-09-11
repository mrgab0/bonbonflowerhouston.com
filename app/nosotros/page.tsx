import { getPosts } from "@/lib/actions/post";
import { NosotrosClient } from "@/components/shop/NosotrosClient";
import { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nosotros & Blog Floral | Gabriela's Flowers LLC Houston",
  description: "Conoce la historia de Gabriela's Flowers LLC en Houston y Pasadena, TX. Arreglos florales de lujo, ramos buchones y guías de cuidado de flores.",
  openGraph: {
    title: "Nosotros & Blog Floral | Gabriela's Flowers",
    description: "Boutique floral de lujo en Houston y Pasadena, Texas. Descubre nuestra historia y blog floral.",
    images: ["https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200"]
  }
};

export default async function NosotrosPage() {
  const { data: posts } = await getPosts({ publishedOnly: true });

  return <NosotrosClient initialPosts={posts || []} locale="es" />;
}
