"use client";

import React from "react";
import { Clock, PenTool, Sparkles, UserCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export function PillarsOfExcellence() {
  const pathname = usePathname();
  const isSpanish = pathname?.startsWith("/es");

  const pillars = [
    {
      id: "mismo-dia",
      title: isSpanish ? "Entrega Mismo Día" : "Same-Day Delivery",
      description: isSpanish
        ? "Ordenando antes de la 1:00 PM con ventana garantizada."
        : "Order before 1:00 PM with guaranteed window.",
      icon: Clock,
      badge: "SAME DAY",
    },
    {
      id: "tarjeta-lujo",
      title: isSpanish ? "Tarjeta de Lujo" : "Luxury Gift Card",
      description: isSpanish
        ? "Mensaje personalizado caligrafiado sin costo adicional."
        : "Complimentary handwritten custom message.",
      icon: PenTool,
      badge: isSpanish ? "INCLUIDO" : "INCLUDED",
    },
    {
      id: "rosas-frescas",
      title: isSpanish ? "Rosas Frescas 100% Naturales" : "100% Natural Fresh Roses",
      description: isSpanish
        ? "Corte selecto de exportación con máxima apertura y aroma."
        : "Select export-grade cut with maximum bloom and fragrance.",
      icon: Sparkles,
      badge: isSpanish ? "CALIDAD VIP" : "VIP QUALITY",
    },
    {
      id: "white-glove",
      title: "White-Glove Service",
      description: isSpanish
        ? "Entrega presencial con chofer capacitado y confirmación."
        : "Hand delivery with trained driver and photo confirmation.",
      icon: UserCheck,
      badge: isSpanish ? "HOUSTON CHOFER" : "HOUSTON DRIVER",
    },
  ];

  return (
    <section className="w-full bg-[#FAF7F5] dark:bg-[#0E0F15] py-8 sm:py-10 border-b border-stone-200/60 dark:border-gray-800/80 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="group p-5 rounded-2xl bg-white dark:bg-[#15161F] border border-stone-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-[#FF97A4]/20 flex items-center justify-center text-[#B0004A] dark:text-[#FF97A4] shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white uppercase tracking-wider truncate">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
