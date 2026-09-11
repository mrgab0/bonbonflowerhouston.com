"use client";

import { useState, useCallback, useMemo, startTransition } from "react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { AddonSelection } from "@/components/shop/AddonSelection";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CheckCircle2, Flower2, Package, Sparkles, ShieldCheck, Truck, Tag, ArrowDown, Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";

export const ProductDetail = ({ product }: { product: any }) => {
  const t = useTranslations("ProductDetail");
  const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; value?: string; price?: number; name?: string }[]>([]);
  const [lastAddonToast, setLastAddonToast] = useState<{ name: string; price: number } | null>(null);

  const images = useMemo(() => (
    product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"]
  ), [product.images]);

  const [activeImage, setActiveImage] = useState(images[0]);

  // Formateador de viñetas para la descripción
  const descriptionBullets = useMemo(() => (
    (product.description || "")
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
  ), [product.description]);

  // Cálculo Dinámico del Precio Combinado (Base + Adicionales)
  const basePrice = Number(product.price || 0);
  const { addonsTotalPrice, combinedTotalPrice } = useMemo(() => {
    const addonsTotal = selectedAddons.reduce((acc, curr) => acc + (curr.price || 0), 0);
    return {
      addonsTotalPrice: addonsTotal,
      combinedTotalPrice: basePrice + addonsTotal
    };
  }, [selectedAddons, basePrice]);

  const handleSelectionChange = useCallback((newSelection: { addonId: string; value?: string; price?: number; name?: string }[]) => {
    setSelectedAddons(newSelection);
    // Si se añadió un nuevo adicional, disparamos el tooltip de forma no bloqueante con startTransition
    if (newSelection.length > selectedAddons.length) {
      const added = newSelection[newSelection.length - 1];
      if (added && added.name) {
        startTransition(() => {
          setLastAddonToast({ name: added.name || "Adicional", price: added.price || 0 });
        });
        setTimeout(() => {
          startTransition(() => {
            setLastAddonToast(null);
          });
        }, 4500);
      }
    }
  }, [selectedAddons.length]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0F1015] flex flex-col font-sans">
      {/* Header Visible con Logo al Home y Carrito */}
      <ShopHeader />

      {/* Contenido Principal */}
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-10">
          
          {/* Tarjeta Principal de Producto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white dark:bg-[#181922] p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            
            {/* COLUMNA IZQUIERDA: Galería de Imágenes (hasta 7 fotos) */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-[#12131A] border border-gray-100 dark:border-gray-800 shadow-sm group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Insignia o Categoría Flotante */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#1A1C1C] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="bg-[#FF97A4] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Tira de Miniaturas Seleccionables */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === img ? "border-[#FF97A4] ring-2 ring-[#FF97A4]/30 scale-105" : "border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Información y Especificaciones Estructuradas */}
            <div className="flex flex-col space-y-6">
              
              {/* Titular y Precio Dinámico */}
              <div>
                <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em] block mb-1">
                  Arreglo Floral Exclusivo
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-[#1A1C1C] dark:text-white leading-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-baseline gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-[#FF97A4] transition-all">
                      ${combinedTotalPrice.toFixed(2)} USD
                    </span>
                    {addonsTotalPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through font-bold">
                        ${basePrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {addonsTotalPrice > 0 && (
                    <span className="bg-pink-50 dark:bg-pink-950/50 text-[#FF97A4] text-xs font-black px-3 py-1 rounded-full border border-pink-200 dark:border-pink-800 flex items-center gap-1 animate-pulse">
                      <Sparkles size={13} /> +${addonsTotalPrice.toFixed(2)} en adicionales
                    </span>
                  )}
                </div>
              </div>

              {/* CAJA VISUAL DE ESPECIFICACIONES */}
              <div className="bg-gray-50/80 dark:bg-[#12131A] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FF97A4]" /> Especificaciones del Diseño
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {product.flowerCount ? (
                    <div className="bg-white dark:bg-[#181922] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                      <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                        <Flower2 size={16} />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Flores</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{product.flowerCount} Rosas Frescas</span>
                      </div>
                    </div>
                  ) : null}

                  {product.bouquetType ? (
                    <div className="bg-white dark:bg-[#181922] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                      <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                        <Package size={16} />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Presentación</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{product.bouquetType}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-white dark:bg-[#181922] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                    <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                      <Truck size={16} />
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Entrega</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">Mismo Día Disponible</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#181922] p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
                    <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Garantía</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">Flores 100% Frescas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIÑETAS / CARACTERÍSTICAS DINÁMICAS (Features) */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('includesTitle')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-white dark:bg-[#181922] p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <CheckCircle2 size={16} className="text-[#FF97A4] flex-shrink-0" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          <strong className="text-gray-900 dark:text-white">{feature.label}:</strong> {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN DE ADICIONALES COMPATIBLES */}
              {product.addons && product.addons.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Tag size={14} className="text-[#FF97A4]" /> {t('addonsTitle')}
                  </h3>
                  <AddonSelection addons={product.addons} onSelectionChange={handleSelectionChange} />
                </div>
              )}

              {/* DESCRIPCIÓN SECTORIZADA EN VIÑETAS LIMPIAS */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{t('descriptionTitle')}</h3>
                <div className="bg-white dark:bg-[#181922] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-sm text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                  {descriptionBullets.map((paragraph: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF97A4] mt-2 flex-shrink-0" />
                      <p>{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÓN AGREGAR AL CARRITO CON ANIMACIÓN GAMIFICADA Y FLECHA TUTORIAL */}
              <div className="pt-4 mt-auto space-y-3 relative">

                {/* Toast / Tooltip Flotante Animado cuando se selecciona un adicional */}
                {lastAddonToast && (
                  <div className="p-3 bg-[#1A1C1C] text-white rounded-2xl shadow-xl border border-pink-500/30 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#FF97A4] rounded-lg text-white">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold block text-white">¡+1 {lastAddonToast.name} añadido al regalo!</span>
                        <span className="text-[10px] text-pink-300 font-medium">Sumado al total: ${combinedTotalPrice.toFixed(2)} USD</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#FF97A4] bg-white/10 px-2.5 py-1 rounded-full">
                      +${lastAddonToast.price.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Banner Tutorial Animado estilo Boutique con Flecha Rebotando cuando hay adicionales */}
                {selectedAddons.length > 0 && (
                  <div className="p-3.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl shadow-lg border border-pink-300/40 flex items-center justify-between animate-bounce duration-1000">
                    <div className="flex items-center gap-2.5">
                      <Flower2 size={20} className="text-pink-200 animate-spin duration-1000" />
                      <span className="text-xs font-black tracking-wide">
                        🌸 ¡Tu ramo personalizado está listo! Presiona el botón de abajo 🌸
                      </span>
                    </div>
                    <ArrowDown size={20} className="text-white animate-pulse" />
                  </div>
                )}

                <AddToCartButton
                  product={{
                    ...product,
                    price: combinedTotalPrice,
                    selectedAddons
                  }}
                />
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

