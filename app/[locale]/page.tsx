import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { HeroSlider } from "@/components/shop/HeroSlider/HeroSlider";
import { StickyNav } from "@/components/shop/StickyNav";
import { FeaturedProductsSlider } from "@/components/shop/FeaturedProductsSlider";
import { FlashSaleCollectionsSection } from "@/components/shop/FlashSaleCollectionsSection";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getSiteConfig } from "@/lib/actions/siteConfig";
import { getSliders } from "@/lib/actions/slider";
import { PhoneCall, Sparkles, MapPin, Truck, Globe2 } from "lucide-react";

// Code splitting dinámico para componentes bajo el pliegue (Below the fold)
const SocialAndReviewsSection = dynamic(
  () => import("@/components/shop/SocialAndReviewsSection").then((m) => m.SocialAndReviewsSection),
  { ssr: true }
);

const CustomIframeSection = dynamic(
  () => import("@/components/shop/CustomIframeSection").then((m) => m.CustomIframeSection),
  { ssr: true }
);

const AnimatedButterflies = dynamic(
  () => import("@/components/shop/AnimatedButterflies").then((m) => m.AnimatedButterflies)
);

const DeliveryShowcaseBanners = dynamic(
  () => import("@/components/shop/DeliveryShowcaseBanners").then((m) => m.DeliveryShowcaseBanners),
  { ssr: true }
);

const Footer = dynamic(
  () => import("@/components/shop/Footer").then((m) => m.Footer),
  { ssr: true }
);

// Incremental Static Revalidation (ISR) a 60 segundos para respuesta perimetral instantánea
export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await dbConnect();

  const [t, productsRaw, siteConfigRes, slidersRes] = await Promise.all([
    getTranslations({ locale }),
    Product.find({ isActive: { $ne: false } })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(16)
      .lean(),
    getSiteConfig(),
    getSliders(),
  ]);

  const products = JSON.parse(JSON.stringify(productsRaw));
  const siteConfig = siteConfigRes?.data;
  const initialSlides = slidersRes?.data ? [...slidersRes.data].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  const desktopCols = siteConfig?.productColumnsDesktop || 3;
  let gridColsClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
  if (desktopCols === 4) {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
  } else if (desktopCols === 5) {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6";
  }

  const firstBannerImage = initialSlides.length > 0 && initialSlides[0].type === 'banner' && !initialSlides[0].image?.match(/\.(mp4|webm|ogg)$/i)
    ? initialSlides[0].image
    : null;

  const preloadBannerUrl = firstBannerImage
    ? (firstBannerImage.includes("images.unsplash.com")
        ? `${firstBannerImage.split("?")[0]}?w=600&q=75&auto=format`
        : firstBannerImage.includes("ik.imagekit.io")
        ? `${firstBannerImage.split("?")[0]}?tr=w-600,q-75,f-auto`
        : firstBannerImage)
    : null;

  return (
    <main className="min-h-screen bg-[#fff8f7] dark:bg-[#0B0C10] text-[#221a19] dark:text-gray-100 transition-colors duration-300 relative overflow-x-hidden">
      {preloadBannerUrl && (
        <link
          rel="preload"
          as="image"
          href={preloadBannerUrl}
          fetchPriority="high"
        />
      )}
      
      {/* Componente de Mariposas Animadas con Aleteo 3D (Ultra ligero 1.5KB) */}
      <AnimatedButterflies />

      {/* Header & Sticky Nav Bar con Mega-Menu integrado */}
      <StickyNav siteConfig={siteConfig} />

      {/* Hero Section Editorial (Estilo Botanical Romance & Gabriela's Flowers) */}
      <section className="relative z-20 min-h-[480px] pt-8 pb-14 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-[#faeae9]/50 to-transparent dark:from-transparent dark:via-[#181922]/50 dark:to-transparent border-b border-[#D4AF37]/20 transition-colors duration-300">
        
        <div className="container mx-auto px-6 text-center z-20 flex flex-col items-center">
          
          {/* Logo Oficial de Gabriela's Flowers */}
          <div className="mb-5 relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D4AF37] via-[#8B0024] to-[#D4AF37] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <img
              src="/logo.jpg"
              alt="Gabriela's Flowers Logo"
              width={96}
              height={96}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-xl border-2 border-[#D4AF37]/80 transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Kicker Editorial */}
          <div className="inline-flex items-center gap-2 bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0024] dark:text-pink-300 border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.15em] mb-4 shadow-sm">
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span>Boutique Floral de Lujo</span>
          </div>

          {/* Título Principal en Playfair Display */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#2a0002] dark:text-white mb-4 tracking-tight leading-tight">
            {(!siteConfig?.heroTitle || siteConfig.heroTitle.includes("Flowers For You")) ? "Gabriela's Flowers LLC" : siteConfig.heroTitle}
          </h1>

          {/* Eslogan e Información de Ubicación / Servicios */}
          <div className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8 font-medium leading-relaxed space-y-2">
            <p className="font-serif italic text-[#8B0024] dark:text-pink-300 text-lg sm:text-xl font-semibold">
              {locale === 'en' ? t('Index.description') : '"Detalles que enamoran"'}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold pt-1">
              <span className="flex items-center gap-1"><MapPin size={15} className="text-[#8B0024]" /> Houston & Pasadena, TX</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Truck size={15} className="text-[#8B0024]" /> Delivery Disponible</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Globe2 size={15} className="text-[#8B0024]" /> Hablamos Español</span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a 
              href="tel:+18323911835"
              className="w-full sm:w-auto bg-[#2a0002] hover:bg-[#8B0024] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl shadow-pink-950/20 border border-[#D4AF37]/60 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <PhoneCall size={16} className="text-[#D4AF37] group-hover:rotate-12 transition-transform" />
              <span>Contáctanos: +1 832 391-1835</span>
            </a>

            <a 
              href="/productos" 
              className="w-full sm:w-auto bg-white dark:bg-gray-900 text-[#2a0002] dark:text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#fff0ef] transition-all border border-gray-200 dark:border-gray-800 shadow-md hover:scale-105 active:scale-95"
            >
              {locale === 'en' ? t('Index.exploreButton') : (siteConfig?.heroButtonText || "Explorar Colección")}
            </a>
          </div>

        </div>
      </section>

      {/* Slider Section */}
      <div className="container mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 relative z-20">
        <HeroSlider initialSlides={initialSlides} />
      </div>

      {/* 2. NUEVO: Slider de Productos Destacados con Pestañas de Filtrado */}
      <FeaturedProductsSlider products={products.slice(0, 8)} />

      {/* 4. NUEVO: Hub de Colección 2026 & Oferta Flash con Reloj en Vivo */}
      <FlashSaleCollectionsSection />

      {/* Módulo iFrame Personalizado */}
      {siteConfig?.enableCustomIframe && (
        <CustomIframeSection
          title={siteConfig.customIframeTitle}
          iframeHtml={siteConfig.customIframeHtml}
        />
      )}

      {/* Product Grid con Columnas Dinámicas (Catálogo Principal) */}
      <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 z-20 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-b border-[#D4AF37]/20 gap-4">
          <div>
            <span className="text-[#8B0024] dark:text-pink-400 text-xs font-bold uppercase tracking-[0.2em] block mb-1">
              {t('Index.premiumSelection')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2a0002] dark:text-white">
              {t('Index.ourFlowers')}
            </h2>
          </div>
          <a href="/productos" className="text-[#8B0024] dark:text-pink-400 font-bold text-sm border-b-2 border-[#D4AF37] pb-1 hover:text-[#2a0002] transition-all">
            {t('Index.viewCatalog')} ↗
          </a>
        </div>

        <div className={gridColsClass}>
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
            <p className="col-span-full text-center text-gray-500 py-8 font-medium">{t('Index.noProducts')}</p>
          )}
        </div>
      </section>

      {/* 3. NUEVO: Banners Dobles de Demostración de Entregas & Diseños VIP */}
      <DeliveryShowcaseBanners />

      {/* Secciones Combinadas en 2 Columnas Paralelas (Instagram & Trustpilot) */}
      <SocialAndReviewsSection
        enableReviews={siteConfig?.enableReviewsSection !== false}
        reviewsTitle={locale === 'en' ? undefined : siteConfig?.reviewsTitle}
        ratingScore={locale === 'en' ? undefined : siteConfig?.reviewsRatingScore}
        countText={locale === 'en' ? undefined : siteConfig?.reviewsCountText}
        trustpilotWidgetHtml={siteConfig?.trustpilotWidgetHtml}
        enableSocialFeed={siteConfig?.enableSocialFeed !== false}
        socialTitle={siteConfig?.socialFeedTitle || "Síguenos en Instagram 📸"}
        embedHtml={siteConfig?.socialEmbedHtml}
        instagramUrl={siteConfig?.instagramUrl || "https://instagram.com"}
      />

      <Footer siteConfig={siteConfig} />
    </main>
  );
}
