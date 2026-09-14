"use client";

import React from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

interface StoreLocationSectionProps {
  phone?: string;
  email?: string;
  whatsappUrl?: string;
}

export const StoreLocationSection: React.FC<StoreLocationSectionProps> = ({
  phone = "(346) 348-4835",
  email = "contacto@bonbonflowershouston.com",
  whatsappUrl = "https://wa.me/13463484835?text=Hola!%20Quisiera%20información%20sobre%20sus%20flores%20en%20Houston."
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[520px] map-pattern border-t border-b border-stone-300 dark:border-gray-800 overflow-hidden select-none">
      {/* Overlay esquemático de mapa estilizado de Houston */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Autopistas principales de Houston (I-10, I-610 Loop, I-45, Hwy 59) */}
          <line stroke="#cbd5e1" strokeWidth="14" x1="0%" x2="100%" y1="50%" y2="50%" />
          <line stroke="#cbd5e1" strokeWidth="14" x1="50%" x2="50%" y1="0%" y2="100%" />
          <line stroke="#f1f5f9" strokeWidth="18" x1="15%" x2="85%" y1="0%" y2="100%" />
          <line stroke="#e2e8f0" strokeWidth="12" x1="85%" x2="15%" y1="0%" y2="100%" />
          <circle cx="50%" cy="50%" r="22%" stroke="#cbd5e1" strokeWidth="10" fill="none" />
          
          <text fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="1.5" x="25%" y="47%">INTERSTATE 10</text>
          <text fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="1.5" x="52%" y="20%">I-45 NORTH</text>
          <text fill="#475569" fontSize="14" fontWeight="800" letterSpacing="2" x="53%" y="46%">HOUSTON DOWNTOWN</text>
          <text fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="1.5" x="30%" y="75%">THE GALLERIA / MEMORIAL</text>
        </svg>
      </div>

      {/* Pin animado en Houston, TX */}
      <div className="absolute left-[50%] md:left-[55%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
        <div className="text-[#163422] animate-bounce drop-shadow-lg">
          <MapPin size={42} fill="#163422" className="text-white" />
        </div>
        <span className="bg-white/95 text-stone-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md border border-stone-300 uppercase tracking-wider -mt-1">
          Bonbon Flowers Houston
        </span>
      </div>

      {/* Marca de agua estilo mapa */}
      <div className="absolute bottom-3 left-6 z-10 text-[11px] text-stone-500 font-sans flex items-center gap-2 select-none">
        <span className="font-bold text-stone-600 text-sm tracking-tight">Houston Metro Map</span>
        <span>• Same Day Local Floral Delivery</span>
      </div>

      {/* Tarjeta flotante de lujo con información del estudio y entregas */}
      <div className="relative md:absolute top-8 left-4 right-4 md:right-auto md:left-12 z-20 max-w-sm w-auto md:w-full bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-md p-6 sm:p-7 shadow-2xl rounded-2xl border border-stone-200 dark:border-gray-800 text-stone-900 dark:text-gray-100">
        <div className="inline-flex items-center gap-1.5 bg-stone-100 dark:bg-gray-800 text-[#163422] dark:text-[#C5A059] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
          <MapPin size={11} />
          <span>Houston Floral Studio</span>
        </div>

        <h3 className="text-base font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-2 font-serif">
          Pick-Up &amp; Delivery Hub
        </h3>
        <p className="text-stone-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
          Houston, Texas &amp; Greater Houston Metroplex<br />
          <span className="text-[11px] text-stone-500 dark:text-gray-400">Entregas a domicilio garantizadas el mismo día.</span>
        </p>

        <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-gray-800">
          <div>
            <h4 className="text-[11px] font-bold text-stone-900 dark:text-gray-200 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Phone size={12} className="text-[#163422]" />
              <span>Teléfono / Pedidos</span>
            </h4>
            <a
              href={`tel:${cleanPhone || "+13463484835"}`}
              className="text-xs sm:text-sm text-stone-800 dark:text-gray-300 hover:text-[#163422] transition-colors font-semibold"
            >
              {phone}
            </a>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-stone-900 dark:text-gray-200 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Mail size={12} className="text-[#163422]" />
              <span>Correo Electrónico</span>
            </h4>
            <a
              href={`mailto:${email}`}
              className="text-xs sm:text-sm text-stone-800 dark:text-gray-300 hover:text-[#163422] transition-colors font-medium break-all"
            >
              {email}
            </a>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-gray-800">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#163422] hover:bg-[#1B2E22] text-white py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle size={15} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
