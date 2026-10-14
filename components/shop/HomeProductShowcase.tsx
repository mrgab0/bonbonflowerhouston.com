"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { Sparkles, ArrowRight } from "lucide-react";

interface HomeProductShowcaseProps {
  products: any[];
}

export function HomeProductShowcase({ products }: HomeProductShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODOS");

  // Obtener categorías únicas dinámicas de los productos + opciones sugeridas
  const filterCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) {
        set.add(p.category.trim());
      }
    });
    return ["TODOS", ...Array.from(set)];
  }, [products]);

  // Filtrar productos de acuerdo a la selección
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "TODOS") {
      return products;
    }
    return products.filter((p) => p.category?.trim().toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-20 relative select-none"
      data-purpose="product-collection"
      id="catalogo"
    >
      {/* Encabezado Editorial Stitch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059] dark:text-[#E6C98B]">
              M O S T &nbsp; L O V E D
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-white tracking-tight">
            Composiciones Esculturales
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
            Bouquets monumentales y cajas couture preparadas a mano por nuestros floristas principales en Houston.
          </p>
        </div>

        {/* Chip de Disponibilidad en Línea */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-mono">{filteredProducts.length}/{products.length} EN LÍNEA</span>
          <span className="text-stone-400 dark:text-gray-500">•</span>
          <span className="hidden sm:inline">Disponibilidad Inmediata</span>
        </div>
      </div>

      {/* Chips de Filtro Interactivo en Tiempo Real */}
      {filterCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 active:scale-95 shadow-sm ${
                  isActive
                    ? "bg-[#163422] text-white dark:bg-[#C5A059] dark:text-stone-950 shadow-md scale-105"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-[#15161F] dark:text-gray-300 dark:hover:bg-gray-800 border border-stone-200/80 dark:border-gray-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Cuadrícula de Productos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 animate-in fade-in duration-300">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
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
          <div className="col-span-full text-center py-16 bg-stone-50 dark:bg-[#12131A] rounded-3xl border border-stone-200/60 dark:border-gray-800 p-8">
            <Sparkles className="w-10 h-10 text-stone-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-stone-600 dark:text-gray-400 font-semibold text-sm">
              No hay arreglos en esta categoría por el momento.
            </p>
            <button
              onClick={() => setSelectedCategory("TODOS")}
              className="mt-4 px-4 py-2 rounded-full bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
            >
              Ver Todas las Colecciones
            </button>
          </div>
        )}
      </div>

      {/* Botón Ver Todo el Catálogo */}
      <div className="mt-14 text-center">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-[#163422] hover:bg-[#1B2E22] dark:bg-[#C5A059] dark:hover:bg-[#d8b56f] text-white dark:text-stone-950 text-xs font-bold tracking-widest uppercase px-10 py-4 transition-all duration-300 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group"
        >
          <span>VER TODAS LAS COLECCIONES ({products.length} ARREGLOS)</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
