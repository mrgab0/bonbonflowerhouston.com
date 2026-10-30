"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function WebsiteLaunchCelebration() {
  const pathname = usePathname();

  // No mostrar en ninguna pantalla administrativa
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Idioma: Español en rutas /es, Inglés por defecto en /en y la raíz /
  const isSpanish = pathname?.startsWith("/es");

  return (
    <>
      <style jsx global>{`
        @keyframes bowWiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }
        .bow-wiggle-anim {
          display: inline-block;
          animation: bowWiggle 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* LACITO EN EL BORDE SUPERIOR DERECHO (CORNER RIBBON SIN MODIFICACIONES) */}
      <div 
        aria-hidden="true"
        className="fixed top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 overflow-hidden z-50 pointer-events-none select-none print:hidden"
      >
        <div 
          className="absolute top-6 -right-12 sm:top-8 sm:-right-10 w-44 sm:w-52 transform rotate-45 text-center py-1 sm:py-1.5 shadow-md flex items-center justify-center gap-1.5 border-y border-[#C5A059]/60"
          style={{
            background: "linear-gradient(135deg, #FF97A4 0%, #D85C6E 100%)",
            boxShadow: "0 4px 15px rgba(216, 92, 110, 0.4)",
          }}
        >
          <span className="bow-wiggle-anim text-xs sm:text-sm leading-none">🎀</span>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white drop-shadow-xs">
            {isSpanish ? "¡ESTRENO HOY!" : "GRAND OPENING!"}
          </span>
        </div>
      </div>
    </>
  );
}

export default WebsiteLaunchCelebration;
