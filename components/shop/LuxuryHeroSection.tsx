"use client";

import React from "react";
import Link from "next/link";
import { Truck, MailCheck, Sparkles, Star } from "lucide-react";

interface LuxuryHeroSectionProps {
  siteConfig?: any;
}

export const LuxuryHeroSection: React.FC<LuxuryHeroSectionProps> = ({ siteConfig }) => {
  const logoUrl = siteConfig?.logoUrl || "https://bonbonflowershouston.com/logo.png";
  const catalogUrl = "/productos";

  return (
    <section className="relative overflow-hidden bg-[#FAF5F0] dark:bg-[#0F1015] py-12 md:py-20 lg:py-24 border-b border-stone-200 dark:border-gray-800 transition-colors duration-300 select-none">
      {/* Elementos decorativos florales laterales con ligera rotación (inspirados en flor.zip) */}
      <div className="absolute inset-0 flex justify-between items-center opacity-30 dark:opacity-20 pointer-events-none px-4 md:px-12 select-none overflow-hidden">
        {/* Bouquet Izquierdo */}
        <div className="w-56 md:w-80 transform -translate-x-10 rotate-[-6deg] hidden sm:block">
          <img
            alt="Bouquet Presentation Left"
            className="rounded-3xl shadow-2xl w-full object-cover aspect-[3/4]"
            src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&q=75&auto=format"
          />
        </div>
        {/* Bouquet Derecho */}
        <div className="w-56 md:w-80 transform translate-x-10 rotate-[6deg] hidden sm:block">
          <img
            alt="Bouquet Presentation Right"
            className="rounded-3xl shadow-2xl w-full object-cover aspect-[3/4]"
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&q=75&auto=format"
          />
        </div>
      </div>

      {/* Contenido Central Hero */}
      <div className="relative max-w-4xl mx-auto text-center px-4 z-10">
        
        {/* Logotipo Oficial de Bonbon Flowers con aro dorado */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A059] via-[#B81845] to-[#C5A059] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <img
              src={logoUrl}
              alt="Bonbon Flowers Houston"
              width={90}
              height={90}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-xl border-2 border-[#C5A059] transform hover:scale-105 transition-transform duration-300 bg-white"
            />
          </div>
        </div>

        {/* Kicker de marca en tipografía dorada con tracking amplio */}
        <p className="text-[#C5A059] dark:text-[#E6C98B] font-serif tracking-[0.25em] uppercase text-xs md:text-sm font-semibold mb-2">
          Bonbon Flowers Houston
        </p>

        {/* Titular Principal Editorial con Script Cursivo "feel loved ♡" */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-luxury-serif text-stone-900 dark:text-white leading-tight font-normal">
          Flowers that <br className="hidden sm:block" />make them <br />
          <span className="font-script-custom text-[#B81845] dark:text-[#FF809F] text-6xl md:text-8xl lg:text-9xl block -mt-2 md:-mt-4">
            feel loved ♡
          </span>
        </h1>

        <p className="text-stone-700 dark:text-gray-300 text-sm md:text-base font-medium mt-3 mb-8 max-w-lg mx-auto">
          Same day luxury flower delivery in Houston, TX &amp; surrounding areas.
        </p>

        {/* Fila de 4 Badges de Valor con estilo circular limpio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 text-stone-700 dark:text-gray-300">
          {/* Badge 1 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-[#181922]/60 backdrop-blur-sm border border-stone-200/60 dark:border-gray-800">
            <div className="w-10 h-10 mb-1 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#B81845] dark:text-pink-400">
              <Truck size={18} />
            </div>
            <span className="text-xs font-semibold text-center leading-snug">
              Same Day<br />Delivery
            </span>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-[#181922]/60 backdrop-blur-sm border border-stone-200/60 dark:border-gray-800">
            <div className="w-10 h-10 mb-1 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#B81845] dark:text-pink-400">
              <MailCheck size={18} />
            </div>
            <span className="text-xs font-semibold text-center leading-snug">
              Personalized<br />Card Included
            </span>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-[#181922]/60 backdrop-blur-sm border border-stone-200/60 dark:border-gray-800">
            <div className="w-10 h-10 mb-1 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#B81845] dark:text-pink-400">
              <Sparkles size={18} />
            </div>
            <span className="text-xs font-semibold text-center leading-snug">
              Premium<br />Roses &amp; Flowers
            </span>
          </div>

          {/* Badge 4 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/60 dark:bg-[#181922]/60 backdrop-blur-sm border border-stone-200/60 dark:border-gray-800">
            <div className="w-10 h-10 mb-1 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#B81845] dark:text-pink-400">
              <Star size={18} fill="#B81845" />
            </div>
            <span className="text-xs font-semibold text-center leading-snug">
              5-Star<br />Rated Boutique
            </span>
          </div>
        </div>

        {/* Botón CTA Principal de Lujo */}
        <div className="mb-4">
          <Link
            href={catalogUrl}
            className="inline-flex items-center justify-center bg-[#B81845] hover:bg-[#911035] text-white text-sm md:text-base font-bold tracking-wider px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <span>SHOP BEST SELLERS</span>
            <span className="ml-2.5 w-6 h-6 rounded-full bg-white text-[#B81845] inline-flex items-center justify-center text-xs font-black transition-transform group-hover:translate-x-0.5">
              ›
            </span>
          </Link>
        </div>

        {/* Prueba social de estrellas */}
        <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm text-stone-600 dark:text-gray-400 font-medium">
          <span className="text-amber-500 text-sm">★★★★★</span>
          <span className="font-bold text-stone-800 dark:text-white ml-1">4.9/5</span>
          <span>Based on 500+ happy customers in Houston</span>
        </div>

      </div>
    </section>
  );
};
