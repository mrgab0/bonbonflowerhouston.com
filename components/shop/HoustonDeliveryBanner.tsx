"use client";

import React from "react";
import { Truck, Phone, MessageCircle, MapPin, Sparkles } from "lucide-react";

interface HoustonDeliveryBannerProps {
  phone?: string;
  whatsappUrl?: string;
}

export function HoustonDeliveryBanner({
  phone = "(346) 739-2730",
  whatsappUrl = "https://wa.me/13467392730?text=Hola!%20Quisiera%20pedir%20flores%20en%20Houston.",
}: HoustonDeliveryBannerProps) {
  const neighborhoods = [
    "River Oaks",
    "The Galleria",
    "Downtown",
    "Katy",
    "The Woodlands",
    "Pearland",
    "Sugar Land",
    "Cypress",
    "Heights",
    "Memorial",
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 select-none">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-[#15161E] to-stone-900 border border-stone-800 text-white p-6 sm:p-10 shadow-2xl">
        {/* Glow decorativo de fondo */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF97A4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Entregas Rápidas y Garantizadas en Houston</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              ¿Necesitas una entrega hoy mismo en tu vecindario?
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Llevamos tus arreglos en vehículos climatizados directamente a la puerta de tu ser querido con atención de guante blanco y confirmación por fotografía.
            </p>

            {/* Chips de vecindarios */}
            <div className="flex flex-wrap gap-2 pt-2">
              {neighborhoods.map((zone) => (
                <span
                  key={zone}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-stone-300 flex items-center gap-1 hover:border-[#FF97A4]/40 transition-colors"
                >
                  <MapPin size={10} className="text-[#FF97A4]" />
                  {zone}
                </span>
              ))}
            </div>
          </div>

          {/* Acciones directas */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm"
            >
              <Phone size={16} className="text-[#FF97A4]" />
              <span>{phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FF97A4] hover:bg-[#ff8090] text-stone-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[#FF97A4]/25"
            >
              <MessageCircle size={16} />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
