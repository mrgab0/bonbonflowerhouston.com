"use client";

import Link from 'next/link';
import React from 'react';
import { useCart } from "@/components/shop/Cart/CartContext";
import { useTranslations } from "next-intl";
import { ShoppingBag, Sparkles } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  badge?: string;
  image: string;
  secondaryImage?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  category,
  badge,
  image,
  secondaryImage
}) => {
  const { addToCart } = useCart();
  const t = useTranslations("common");

  const optimizeImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&q=80&auto=format";
    if (url.includes("ik.imagekit.io") && !url.includes("tr=")) {
      return url.includes("?") ? `${url}&tr=w-400,q-80,f-auto` : `${url}?tr=w-400,q-80,f-auto`;
    }
    if (url.includes("images.unsplash.com") && !url.includes("w=")) {
      return `${url}${url.includes("?") ? "&" : "?"}w=400&q=80&auto=format`;
    }
    return url;
  };

  const optimizedMainImage = optimizeImageUrl(image);
  const optimizedSecondaryImage = secondaryImage ? optimizeImageUrl(secondaryImage) : undefined;

  return (
    <div className="group relative bg-white dark:bg-[#12131A] rounded-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0px_4px_20px_rgba(42,0,2,0.04)] hover:shadow-[0px_16px_36px_rgba(42,0,2,0.12)] hover:-translate-y-1 flex flex-col justify-between select-none">
      <Link
        href={`/productos/${slug}`}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="block relative select-none"
      >
        {/* Contenedor de Imagen con Zoom suave y preservación completa del arreglo floral */}
        <div className="relative aspect-square overflow-hidden bg-[#FAFAF9] dark:bg-[#15161E] p-2.5 flex items-center justify-center">
          <img
            src={optimizedMainImage}
            alt={name}
            loading="lazy"
            decoding="async"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className={`w-full h-full object-contain select-none pointer-events-none transform group-hover:scale-105 transition-all duration-700 ease-out ${
              optimizedSecondaryImage ? 'group-hover:opacity-0' : ''
            }`}
          />
          {optimizedSecondaryImage && (
            <img
              src={optimizedSecondaryImage}
              alt={`${name} - alternativa`}
              loading="lazy"
              decoding="async"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="absolute inset-0 w-full h-full object-contain p-2.5 select-none pointer-events-none transform scale-100 group-hover:scale-105 transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          {/* Badge Flotante estilo Categoría */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-[#8B0024] dark:text-pink-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-pink-100 dark:border-pink-900/50 shadow-sm">
              {category}
            </span>
          </div>

          {/* Insignia / Badge Personalizada */}
          {badge && (
            <div className="absolute top-3 right-3">
              <span className="bg-[#2a0002] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-[#D4AF37]/50 flex items-center gap-1">
                <Sparkles size={10} className="text-[#D4AF37]" />
                {badge}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-[#2a0002] dark:text-white group-hover:text-[#B81845] dark:group-hover:text-[#FF809F] transition-colors mb-1 line-clamp-1">
            <Link
              href={`/productos/${slug}`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              {name}
            </Link>
          </h3>
          
          {/* Calificación de 5 estrellas estilo flor.zip */}
          <div className="flex items-center text-[11px] text-amber-500 mb-2">
            <span>★★★★★</span>
            <span className="text-stone-400 dark:text-gray-400 ml-1.5 text-[10px] font-medium">(5.0)</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-800/80 mt-auto">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-gray-400 block font-semibold">From</span>
            <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white font-serif">${price.toFixed(2)} USD</span>
          </div>

          <button 
            onClick={() => addToCart({ id, name, price, image })}
            className="bg-[#163422] hover:bg-[#B81845] text-white px-3 sm:px-3.5 py-2 rounded-lg active:scale-95 transition-all duration-300 font-bold text-xs shadow-sm flex items-center gap-1.5 hover:scale-105"
            title="Añadir al Carrito"
          >
            <ShoppingBag size={13} />
            <span className="hidden sm:inline">{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
