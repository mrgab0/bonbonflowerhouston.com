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
      <aside className="bg-[#009999] text-stone-950 text-xs md:text-sm font-extrabold py-2 px-4 text-center tracking-wide flex justify-center items-center shadow-xs">
        <a
          className="hover:underline flex items-center gap-1.5 transition-opacity hover:opacity-90 font-black text-stone-950"
          href={`tel:${cleanPhone || "+13467392730"}`}
        >
          <Phone size={13} className="inline-block animate-pulse text-stone-950" />
          <span className="font-extrabold">SAME DAY DELIVERY HOUSTON {phone}</span>
          <span className="inline-block transition-transform group-hover:translate-x-1 font-black text-stone-950">→</span>
        </a>
      </aside>

      {/* Barra de 3 compromisos de servicio / Trust Bar */}
      <section className="bg-[#009999] text-stone-950 py-2.5 px-4 text-xs font-black tracking-wider border-t border-stone-950/15 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-around items-center gap-y-2 gap-x-6 uppercase text-[11px] sm:text-xs font-black">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="tracking-wide font-black">SAME DAY DELIVERY HOUSTON</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="tracking-wide font-black">ORDER BEFORE 1 PM FOR SAME-DAY DELIVERY</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-stone-950 shrink-0" />
            <span className="tracking-wide font-black">PROUDLY SERVING HOUSTON METROPLEX</span>
          </div>
        </div>
      </section>
    </div>
  );
};
