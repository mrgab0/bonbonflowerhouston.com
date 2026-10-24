"use client";

import React from "react";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

interface StoreLocationSectionProps {
  phone?: string;
  email?: string;
  whatsappUrl?: string;
}

export const StoreLocationSection: React.FC<StoreLocationSectionProps> = ({
  phone = "(346) 739-2730",
  email = "contacto@bonbonflowershouston.com",
  whatsappUrl = "https://wa.me/13467392730?text=Hola!%20Quisiera%20información%20sobre%20sus%20flores%20en%20Houston."
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[520px] border-t border-b border-stone-300 dark:border-gray-800 overflow-hidden select-none">
      {/* Mapa interactivo fidedigno centrado en 9546 Hammerly Blvd, Houston, TX 77080 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          title="Ubicación Bonbon Flowers Houston - 9546 Hammerly Boulevard"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-95.548%2C29.802%2C-95.518%2C29.819&amp;layer=mapnik&amp;marker=29.8105%2C-95.5323"
          className="w-full h-full border-0 filter contrast-[1.05] brightness-[0.98] dark:invert dark:hue-rotate-180 dark:contrast-125"
          loading="lazy"
        />
        {/* Gradiente ambiental superior e inferior para integración visual de alta costura */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/20 dark:from-[#0B0C10]/40 dark:via-transparent dark:to-[#0B0C10]/30 pointer-events-none" />
      </div>

      {/* Pin animado en Houston, TX */}
      <div className="absolute left-[50%] md:left-[55%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
        <div className="text-[#163422] animate-bounce drop-shadow-lg">
          <MapPin size={42} fill="#163422" className="text-white" />
        </div>
        <span className="bg-white text-black text-[11px] font-black px-3.5 py-1 rounded-full shadow-md border-2 border-[#163422] uppercase tracking-wider -mt-1">
          Bonbon Flowers Houston
        </span>
      </div>

      {/* Marca de agua estilo mapa */}
      <div className="absolute bottom-3 left-6 z-10 text-[11px] text-black bg-white/80 dark:bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md font-sans flex items-center gap-2 select-none shadow-xs">
        <span className="font-bold text-black dark:text-white text-xs tracking-tight">Houston Metro Map</span>
        <span className="font-medium text-stone-700 dark:text-gray-300">• 9546 Hammerly Blvd</span>
      </div>

      {/* Tarjeta flotante de lujo con información del estudio y entregas */}
      <div className="relative md:absolute top-8 left-4 right-4 md:right-auto md:left-12 z-20 max-w-sm w-auto md:w-full bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-md p-6 sm:p-7 shadow-2xl rounded-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-[#E6F7F0]">
        <div className="inline-flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900/80 text-[#163422] dark:text-[#5EEAD4] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 border border-[#163422]/20 dark:border-[#5EEAD4]/30">
          <MapPin size={11} />
          <span>Houston Floral Studio</span>
        </div>

        <h3 className="text-base font-black text-stone-900 dark:text-[#E6F7F0] uppercase tracking-wider mb-1 font-serif">
          Pick-Up &amp; Delivery Hub
        </h3>
        <p className="text-stone-800 dark:text-[#B9E6D3] text-xs sm:text-sm leading-relaxed mb-4 font-medium">
          <strong className="text-stone-950 dark:text-white font-bold block text-sm">
            9546 Hammerly Boulevard, Houston, TX 77080
          </strong>
          <span className="text-[11.5px] text-stone-600 dark:text-[#76C7B2] font-semibold block mt-1">
            Spring Branch West • Retiro en taller y entregas a domicilio el mismo día en todo Houston.
          </span>
        </p>

        <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800">
          <div>
            <h4 className="text-[11px] font-black text-stone-900 dark:text-[#E6F7F0] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Phone size={12} className="text-[#163422] dark:text-[#5EEAD4]" />
              <span>Teléfono / Pedidos</span>
            </h4>
            <a
              href={`tel:${cleanPhone || "+13467392730"}`}
              className="text-xs sm:text-sm text-stone-800 dark:text-[#B9E6D3] hover:text-[#163422] dark:hover:text-[#5EEAD4] transition-colors font-bold"
            >
              {phone}
            </a>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-stone-900 dark:text-[#E6F7F0] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Mail size={12} className="text-[#163422] dark:text-[#5EEAD4]" />
              <span>Correo Electrónico</span>
            </h4>
            <a
              href={`mailto:${email}`}
              className="text-xs sm:text-sm text-stone-800 dark:text-[#B9E6D3] hover:text-[#163422] dark:hover:text-[#5EEAD4] transition-colors font-semibold break-all"
            >
              {email}
            </a>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=9546+Hammerly+Boulevard+Houston+TX+77080"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#D4AF37] hover:bg-[#C09A2E] text-stone-950 py-2.5 px-4 rounded-xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <MapPin size={14} />
            <span>Cómo Llegar en Google Maps</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#163422] hover:bg-[#1B2E22] dark:bg-[#5EEAD4] dark:hover:bg-[#2DD4BF] text-white dark:text-stone-950 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle size={15} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
