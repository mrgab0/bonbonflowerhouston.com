import dynamic from 'next/dynamic';
import { StickyNav } from "@/components/shop/StickyNav";
import { TrustAnnouncementBar } from "@/components/shop/TrustAnnouncementBar";
import { LuxuryHeroSection } from "@/components/shop/LuxuryHeroSection";
import { PillarsOfExcellence } from "@/components/shop/PillarsOfExcellence";
import { HomeProductShowcase } from "@/components/shop/HomeProductShowcase";
import { HoustonDeliveryBanner } from "@/components/shop/HoustonDeliveryBanner";
import { StoreLocationSection } from "@/components/shop/StoreLocationSection";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getSiteConfig } from "@/lib/actions/siteConfig";
import { filterUniqueVariantProducts } from "@/lib/utils/variantFilter";

const SocialAndReviewsSection = dynamic(
  () => import("@/components/shop/SocialAndReviewsSection").then((m) => m.SocialAndReviewsSection),
  { ssr: true }
);

const CustomIframeSection = dynamic(
  () => import("@/components/shop/CustomIframeSection").then((m) => m.CustomIframeSection),
  { ssr: true }
);

const Footer = dynamic(
  () => import("@/components/shop/Footer").then((m) => m.Footer),
  { ssr: true }
);

export const revalidate = 60;

export default async function Home() {
  let products: any[] = [];
  let siteConfig: any = null;

  try {
    await dbConnect();
    const [productsRaw, siteConfigRes] = await Promise.all([
      Product.find({ isActive: { $ne: false } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .lean(),
      getSiteConfig(),
    ]);
    const plainProducts = JSON.parse(JSON.stringify(productsRaw || []));
    const uniqueProducts = filterUniqueVariantProducts(plainProducts);
    products = uniqueProducts.slice(0, 24);
    siteConfig = siteConfigRes?.data;
  } catch (err) {
    console.warn("Aviso: No se pudo conectar a la base de datos durante el pre-renderizado estático de Home. Usando valores seguros.", err);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0B0C10] text-stone-800 dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Barra de anuncio superior (SAME DAY DELIVERY) y barra de confianza */}
      <TrustAnnouncementBar phone="(346) 739-2730" />

      {/* Navegación y Menú Principal */}
      <StickyNav siteConfig={siteConfig} />

      {/* Hero Section Editorial de Lujo Stitch 'Flowers that make them feel loved ♡' */}
      <LuxuryHeroSection siteConfig={siteConfig} />

      {/* 4 Pilares de Excelencia (Entrega Mismo Día, Tarjeta Caligrafiada, Rosas Ecuador, White Glove) */}
      <PillarsOfExcellence />

      {/* Módulo iFrame Personalizado (si está activo en el Administrador) */}
      {siteConfig?.enableCustomIframe && (
        <CustomIframeSection
          title={siteConfig.customIframeTitle}
          iframeHtml={siteConfig.customIframeHtml}
        />
      )}

      {/* Vitrina "Composiciones Esculturales / Most Loved" con Filtros Interactivos */}
      <HomeProductShowcase products={products} />

      {/* Banner de Entregas y Zonas de Cobertura en Houston (River Oaks, Galleria, Katy, Woodlands) */}
      <HoustonDeliveryBanner
        phone="(346) 739-2730"
        whatsappUrl="https://wa.me/13467392730?text=Hola!%20Quisiera%20pedir%20flores%20en%20Houston."
      />

      {/* Sección de Ubicación y Cobertura en Houston (Mapa estilizado y tarjeta flotante) */}
      <StoreLocationSection
        phone="(346) 739-2730"
        email="contacto@bonbonflowershouston.com"
        whatsappUrl="https://wa.me/13467392730?text=Hola!%20Quisiera%20pedir%20flores%20en%20Houston."
      />

      {/* Secciones de Reseñas y Feed de Instagram */}
      <SocialAndReviewsSection
        enableReviews={siteConfig?.enableReviewsSection !== false}
        reviewsTitle={siteConfig?.reviewsTitle}
        ratingScore={siteConfig?.reviewsRatingScore}
        countText={siteConfig?.reviewsCountText}
        trustpilotWidgetHtml={siteConfig?.trustpilotWidgetHtml}
        enableSocialFeed={siteConfig?.enableSocialFeed !== false}
        socialTitle={siteConfig?.socialFeedTitle || "Síguenos en Instagram 📸"}
        embedHtml={siteConfig?.socialEmbedHtml}
        instagramUrl={siteConfig?.instagramUrl || "https://www.instagram.com/bonbonflowers__?stkn=MXBnc3hsbHVlM3psMQ=="}
      />

      {/* Footer de Lujo */}
      <Footer siteConfig={siteConfig} />
    </main>
  );
}

