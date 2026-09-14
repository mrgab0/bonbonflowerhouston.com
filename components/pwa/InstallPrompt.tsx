"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * InstallPrompt: Registra silenciosamente el Service Worker para la PWA
 * sin mostrar avisos flotantes molestos que obstruyan el chatbot Flor.
 */
export function InstallPrompt() {
  const pathname = usePathname();

  useEffect(() => {
    // Si estamos en el Admin, omitir registro
    if (pathname && pathname.startsWith("/admin")) return;

    // Registrar el Service Worker para PWA en tiempo de ocio
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.log("Service Worker registro PWA:", err);
        });
      };
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(registerSW, { timeout: 6000 });
      } else {
        setTimeout(registerSW, 5000);
      }
    }
  }, [pathname]);

  // Retornamos null para que NUNCA aparezca un popup flotante tapando al chatbot
  return null;
}
