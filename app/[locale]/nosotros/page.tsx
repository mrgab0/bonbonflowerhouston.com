import { getPosts } from "@/lib/actions/post";
import { NosotrosClient } from "@/components/shop/NosotrosClient";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: isEn
      ? "About Us & Floral Blog | Gabriela's Flowers LLC Houston"
      : "Nosotros & Blog Floral | Gabriela's Flowers LLC Houston",
    description: isEn
      ? "Discover the story of Gabriela's Flowers LLC in Houston & Pasadena, TX. Luxury rose bouquets, flower care guides, and romantic anniversary arrangements."
      : "Conoce la historia de Gabriela's Flowers LLC en Houston y Pasadena, TX. Arreglos florales de lujo, guías de cuidado de rosas y ramos para aniversarios.",
    openGraph: {
      title: isEn ? "About Us | Gabriela's Flowers" : "Nosotros & Blog Floral | Gabriela's Flowers",
      description: isEn
        ? "Luxury floral boutique in Houston & Pasadena, Texas. Discover our story and floral blog."
        : "Boutique floral de lujo en Houston y Pasadena, Texas. Descubre nuestra historia y blog floral.",
      images: ["https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200"]
    }
  };
}

export default async function LocalizedNosotrosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { data: posts } = await getPosts({ publishedOnly: true });

  return <NosotrosClient initialPosts={posts || []} locale={locale} />;
}
