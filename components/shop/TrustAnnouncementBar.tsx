"use client";

import React from "react";
import { Truck, Clock, MapPin, Phone } from "lucide-react";

interface TrustAnnouncementBarProps {
  phone?: string;
}

export const TrustAnnouncementBar: React.FC<TrustAnnouncementBarProps> = ({
  phone = "(346) 739-2730"
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  return (
    <div className="w-full z-40 relative">
      {/* Barra superior de anuncios estilo boutique de flor.zip */}
      <aside className="bg-[#33cccc] text-stone-900 text-xs md:text-sm font-serif font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] py-2 px-4 text-center flex justify-center items-center shadow-xs border-b border-stone-900/10">
        <a
          className="hover:underline flex items-center gap-2 transition-opacity hover:opacity-85"
          href={`tel:${cleanPhone || "+13467392730"}`}
        >
          <Phone size={13} className="inline-block animate-pulse text-stone-900" />
          <span>SAME DAY DELIVERY HOUSTON • {phone}</span>
          <span className="inline-block transition-transform group-hover:translate-x-1 font-bold text-stone-900">→</span>
        </a>
      </aside>

      {/* Barra de 3 compromisos de servicio / Trust Bar */}
      <section className="bg-[#33cccc] text-stone-900 py-2.5 px-4 text-xs font-serif font-bold tracking-[0.18em] sm:tracking-[0.22em] uppercase border-t border-stone-900/15 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-around items-center gap-y-2 gap-x-6 text-[10px] sm:text-xs">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-stone-900 shrink-0" />
            <span className="tracking-[0.18em] sm:tracking-[0.22em]">SAME DAY DELIVERY HOUSTON</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-stone-900 shrink-0" />
            <span className="tracking-[0.18em] sm:tracking-[0.22em]">ORDER BEFORE 1 PM FOR SAME-DAY DELIVERY</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-stone-900 shrink-0" />
            <span className="tracking-[0.18em] sm:tracking-[0.22em]">PROUDLY SERVING HOUSTON METROPLEX</span>
          </div>
        </div>
      </section>
    </div>
  );
};
