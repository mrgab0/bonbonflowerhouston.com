import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { StickyNav } from "@/components/shop/StickyNav";
import { TrustAnnouncementBar } from "@/components/shop/TrustAnnouncementBar";
import { LuxuryHeroSection } from "@/components/shop/LuxuryHeroSection";
import { StoreLocationSection } from "@/components/shop/StoreLocationSection";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getSiteConfig } from "@/lib/actions/siteConfig";

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

export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  let products: any[] = [];
  let siteConfig: any = null;

  try {
    await dbConnect();
    const [productsRaw, siteConfigRes] = await Promise.all([
      Product.find({ isActive: { $ne: false } })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(20)
        .lean(),
      getSiteConfig(),
    ]);

    products = JSON.parse(JSON.stringify(productsRaw || []));
    siteConfig = siteConfigRes?.data;
  } catch (err) {
    console.warn("Aviso: No se pudo conectar a la base de datos durante el pre-renderizado estático de [locale]/page. Usando valores seguros.", err);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0B0C10] text-stone-800 dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Barra de anuncio superior (SAME DAY DELIVERY) y barra de confianza estilo flor.zip */}
      <TrustAnnouncementBar phone="(346) 348-4835" />

      {/* Navegación y Menú Principal */}
      <StickyNav siteConfig={siteConfig} />

      {/* Hero Section Editorial de Lujo con tipografía script 'feel loved ♡' y 4 badges */}
      <LuxuryHeroSection siteConfig={siteConfig} />

      {/* Módulo iFrame Personalizado (si está activo en el Administrador) */}
      {siteConfig?.enableCustomIframe && (
        <CustomIframeSection
          title={siteConfig.customIframeTitle}
          iframeHtml={siteConfig.customIframeHtml}
        />
      )}

      {/* Vitrina "MOST LOVED" en cuadrícula de 5 columnas (Diseño exacto de flor.zip) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-20 relative select-none" data-purpose="product-collection">
        
        {/* Título de Sección con interletreado dorado y estilo de alta floristería */}
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-2xl font-serif text-[#C5A059] tracking-[0.35em] uppercase font-semibold">
            M O S T &nbsp; L O V E D
          </h2>
          <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-gray-400 mt-2 font-medium">
            Handcrafted Luxury Bouquets &amp; Arrangements • Houston, TX
          </p>
        </div>

        {/* Cuadrícula de 5 columnas en desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductCard 
                key={product._id.toString()}
                id={product._id.toString()}
                name={product.name}
                slug={product.slug}
                price={product.price}
                category={product.category}
                badge={product.badge}
                image={product.images && product.images.length > 0 ? product.images[0] : ""}
                secondaryImage={product.images && product.images.length > 1 ? product.images[1] : undefined}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-12 font-medium">
              No hay productos disponibles por el momento.
            </p>
          )}
        </div>

        {/* Botón Ver Todo el Catálogo */}
        <div className="mt-14 text-center">
          <Link
            href="/productos"
            className="inline-block bg-stone-900 hover:bg-black dark:bg-[#C5A059] dark:hover:bg-[#d8b56f] text-white dark:text-stone-950 text-xs font-semibold tracking-widest uppercase px-10 py-3.5 transition-all duration-300 rounded-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            View all collection
          </Link>
        </div>
      </section>

      {/* Sección de Ubicación y Cobertura en Houston (Mapa estilizado y tarjeta flotante de flor.zip) */}
      <StoreLocationSection
        phone="(346) 348-4835"
        email="contacto@bonbonflowershouston.com"
        whatsappUrl="https://wa.me/13463484835?text=Hola!%20Quisiera%20pedir%20flores%20en%20Houston."
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
