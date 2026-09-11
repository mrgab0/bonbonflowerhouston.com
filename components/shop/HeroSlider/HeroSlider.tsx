"use client";

import { useState, useEffect } from 'react';
import { getSliders } from "@/lib/actions/slider";

interface HeroSliderProps {
  initialSlides?: any[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ initialSlides }) => {
  const [slides, setSlides] = useState<any[]>(initialSlides || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
      return;
    }
    async function fetchSliders() {
      const { data } = await getSliders();
      if (data) {
        const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(sorted);
      }
    }
    fetchSliders();
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  const getOptimizedBannerUrl = (url: string, isThumb = false) => {
    if (!url) return url;
    const base = url.split("?")[0];
    if (isThumb) {
      if (url.includes("ik.imagekit.io")) {
        return `${base}?tr=w-40,q-20,bl-6`;
      }
      if (url.includes("images.unsplash.com")) {
        return `${base}?w=40&q=20&auto=format`;
      }
      return url;
    }
    if (url.includes("ik.imagekit.io")) {
      return `${base}?tr=w-600,q-75,f-auto`;
    }
    if (url.includes("images.unsplash.com")) {
      return `${base}?w=600&q=75&auto=format`;
    }
    return url;
  };

  const getResponsiveBannerSrcSet = (url: string) => {
    if (!url) return undefined;
    if (url.includes("ik.imagekit.io")) {
      const base = url.split("?")[0];
      return `${base}?tr=w-480,q-75,f-auto 480w, ${base}?tr=w-800,q-80,f-auto 800w, ${base}?tr=w-1200,q-80,f-auto 1200w`;
    }
    if (url.includes("images.unsplash.com")) {
      const base = url.split("?")[0];
      return `${base}?w=480&q=75&auto=format 480w, ${base}?w=800&q=80&auto=format 800w, ${base}?w=1200&q=80&auto=format 1200w`;
    }
    return undefined;
  };

  return (
    <div className="mt-8 md:mt-12 relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-[21/9] lg:aspect-[24/9] max-h-[520px] rounded-3xl shadow-2xl border-2 sm:border-4 border-[#D4AF37]/50 dark:border-gray-800 overflow-hidden bg-[#0F1015] transition-all">
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex;
        const isVideo = slide.image?.match(/\.(mp4|webm|ogg)$/i);
        const optimizedBanner = getOptimizedBannerUrl(slide.image);
        const thumbBg = getOptimizedBannerUrl(slide.image, true);
        const bannerSrcSet = getResponsiveBannerSrcSet(slide.image);

        return (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.type === 'banner' ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Fondo Difuminado Ambiental Ultra Liviano */}
                {!isVideo && (
                  <div className="absolute inset-0 overflow-hidden select-none pointer-events-none">
                    <div className="absolute inset-0 flex items-center justify-center filter blur-md sm:blur-lg opacity-90 scale-105 transform-gpu">
                      <img 
                        src={thumbBg} 
                        alt="" 
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover brightness-95 saturate-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                )}

                {/* Banner de Video o Imagen Principal */}
                {isVideo ? (
                  <video 
                    src={slide.image} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <a
                    href={slide.link || '#'}
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                    className={`w-full h-full flex items-center justify-center relative z-10 select-none ${slide.link ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <picture className="w-full h-full block">
                      {slide.mobileImage && (
                        <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                      )}
                      <img 
                        src={optimizedBanner} 
                        srcSet={bannerSrcSet}
                        alt={slide.title || 'Banner'} 
                        sizes="(max-width: 640px) 480px, (max-width: 1024px) 800px, 1200px"
                        fetchPriority={index === 0 ? "high" : "auto"}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="h-full w-full object-cover md:object-contain drop-shadow-xl select-none pointer-events-none"
                      />
                    </picture>
                  </a>
                )}

                {/* Superposición de Texto y Botón CTA */}
                {slide.showOverlay !== false && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col items-start justify-center p-6 md:p-12 text-left pointer-events-none">
                    <div className="pointer-events-auto max-w-xl">
                      {slide.title && (
                        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-2 md:mb-3 tracking-tight">
                          {slide.title}
                        </h2>
                      )}
                      {slide.description && (
                        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 md:mb-6 line-clamp-3 font-medium">
                          {slide.description}
                        </p>
                      )}
                      {slide.link && (
                        <a 
                          href={slide.link} 
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                          className="inline-block bg-[#8B0024] hover:bg-[#2a0002] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all shadow-xl shadow-pink-950/30 border border-[#D4AF37]/60 hover:scale-105 active:scale-95 select-none"
                        >
                          {slide.ctaText || "Ver Oferta"}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
                <h3 className="text-3xl font-serif font-bold mb-4">{slide.title}</h3>
                <div className="text-6xl font-black text-[#8B0024] mb-4">{slide.discountPercentage}% OFF</div>
                <p className="text-gray-500 font-medium">Expira: {new Date(slide.discountExpiry).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Indicadores de Diapositiva (Dots) con tamaño táctil accesible */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className="p-2 flex items-center justify-center focus:outline-none"
            >
              <span className={`h-2.5 rounded-full transition-all duration-300 block ${
                idx === currentIndex ? "w-8 bg-[#D4AF37]" : "w-2.5 bg-white/60 hover:bg-white"
              }`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
