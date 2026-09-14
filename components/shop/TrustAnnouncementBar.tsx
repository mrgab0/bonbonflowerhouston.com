"use client";

import React from "react";
import { Truck, Clock, MapPin, Phone } from "lucide-react";

interface TrustAnnouncementBarProps {
  phone?: string;
}

export const TrustAnnouncementBar: React.FC<TrustAnnouncementBarProps> = ({
  phone = "(346) 348-4835"
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  return (
    <div className="w-full z-40 relative">
      {/* Barra superior de anuncios estilo boutique de flor.zip */}
      <aside className="bg-[#B81845] text-white text-xs md:text-sm font-medium py-2 px-4 text-center tracking-wide flex justify-center items-center">
        <a
          className="hover:underline flex items-center gap-1.5 transition-opacity hover:opacity-95 font-semibold"
          href={`tel:${cleanPhone || "+13463484835"}`}
        >
          <Phone size={13} className="inline-block animate-pulse" />
          <span>SAME DAY DELIVERY HOUSTON {phone}</span>
          <span className="inline-block transition-transform group-hover:translate-x-1 font-bold">→</span>
        </a>
      </aside>

      {/* Barra de 3 compromisos de servicio / Trust Bar */}
      <section className="bg-[#911035] text-white py-2.5 px-4 text-xs font-semibold tracking-wider border-t border-black/10 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-around items-center gap-y-2 gap-x-6 uppercase text-[11px] sm:text-xs">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-[#E6C98B] shrink-0" />
            <span className="tracking-wide">SAME DAY DELIVERY HOUSTON</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#E6C98B] shrink-0" />
            <span className="tracking-wide">ORDER BEFORE 1 PM FOR SAME-DAY DELIVERY</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#E6C98B] shrink-0" />
            <span className="tracking-wide">PROUDLY SERVING HOUSTON METROPLEX</span>
          </div>
        </div>
      </section>
    </div>
  );
};
