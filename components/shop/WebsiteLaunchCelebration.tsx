"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";

export function WebsiteLaunchCelebration() {
  const pathname = usePathname();
  const isSpanish = pathname?.startsWith("/es");
  const [isDismissed, setIsDismissed] = useState(true); // Default true until mounted to avoid hydration mismatch

  useEffect(() => {
    // Verificar si el usuario ya descartó el lazo flotante en esta sesión
    const dismissed = sessionStorage.getItem("bonbon_launch_ribbon_dismissed");
    if (!dismissed) {
      setIsDismissed(false);
    }
  }, []);

  // No mostrar en ninguna pantalla administrativa
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("bonbon_launch_ribbon_dismissed", "true");
  };

  return (
    <>
      <style jsx global>{`
        @keyframes floatRibbon {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }
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
        .ribbon-floating-anim {
          animation: floatRibbon 3.5s ease-in-out infinite;
        }
        .bow-wiggle-anim {
          display: inline-block;
          animation: bowWiggle 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. LACITO EN EL BORDE SUPERIOR DERECHO (CORNER RIBBON) */}
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

      {/* 2. LAZO ANIMADO ABAJITO FLOTANDO */}
      {!isDismissed && (
        <aside 
          aria-label="Anuncio de estreno del sitio web"
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md sm:max-w-lg px-2 pointer-events-auto print:hidden"
        >
          <div 
            className="ribbon-floating-anim relative flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full text-white shadow-2xl border border-white/40 backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, #FF97A4 0%, #E86B7B 60%, #D85C6E 100%)",
              boxShadow: "0 10px 25px -3px rgba(216, 92, 110, 0.45), 0 4px 12px rgba(22, 52, 34, 0.15)",
            }}
          >
            {/* Lazo animado con destellos */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="bow-wiggle-anim text-xl sm:text-2xl shrink-0 filter drop-shadow-xs">
                🎀
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider leading-tight text-white drop-shadow-xs truncate sm:whitespace-normal">
                  {isSpanish
                    ? "ESTAMOS ESTRENANDO SITIO WEB DESDE EL 30 OCT 2026"
                    : "ESTAMOS ESTRENANDO SITIO WEB DESDE EL 30 OCT 2026"}
                </span>
                <span className="text-[9px] sm:text-[10px] font-medium text-white/90 tracking-wide flex items-center gap-1">
                  <Sparkles size={11} className="text-[#FFE5E9] shrink-0" />
                  <span>{isSpanish ? "¡Bienvenido a nuestra nueva boutique digital!" : "Welcome to our new digital boutique!"}</span>
                </span>
              </div>
            </div>

            {/* Botón discreto de cierre */}
            <button
              onClick={handleDismiss}
              aria-label="Cerrar anuncio"
              className="p-1 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white/80 hover:text-white shrink-0 ml-1"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
export default WebsiteLaunchCelebration;
