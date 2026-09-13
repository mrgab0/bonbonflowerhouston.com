import { getPosts } from "@/lib/actions/post";
import { NosotrosClient } from "@/components/shop/NosotrosClient";
import { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    title: isEn
      ? "About Us & Floral Blog | Bonbon Flowers Houston"
      : "Nosotros & Blog Floral | Bonbon Flowers Houston",
    description: isEn
      ? "Discover the story of Bonbon Flowers in Houston, TX. Luxury rose bouquets, flower care guides, and romantic anniversary arrangements."
      : "Conoce la historia de Bonbon Flowers en Houston, TX. Arreglos florales de lujo, guías de cuidado de rosas y ramos para aniversarios.",
    openGraph: {
      title: isEn ? "About Us | Bonbon Flowers" : "Nosotros & Blog Floral | Bonbon Flowers",
      description: isEn
        ? "Luxury floral boutique in Houston, Texas. Discover our story and floral blog."
        : "Boutique floral de lujo en Houston, Texas. Descubre nuestra historia y blog floral.",
      images: ["https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200"]
    }
  };
}

export default async function LocalizedNosotrosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { data: posts } = await getPosts({ publishedOnly: true });

  return <NosotrosClient initialPosts={posts || []} locale={locale} />;
}
