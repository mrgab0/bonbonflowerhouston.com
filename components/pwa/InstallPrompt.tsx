"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Smartphone, CheckCircle2, Share, Sparkles } from "lucide-react";

export function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Si estamos en cualquier ruta del Panel de Administración, NO mostrar el prompt de instalación
    if (pathname && pathname.startsWith("/admin")) {
      setShowPrompt(false);
      return;
    }

    // Verificar si el usuario ya cerró el aviso en esta sesión
    const isDismissed = sessionStorage.getItem("pwa_dismissed");
    if (isDismissed) return;

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

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(userAgent);
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isStandalone = ("standalone" in window.navigator) && (window.navigator as any).standalone;

    if (isIphone && !isStandalone) {
      setIsIOS(true);
      const timer = setTimeout(() => setShowPrompt(true), 7000);
      return () => clearTimeout(timer);
    }

    if (isMobile && !isStandalone) {
      // Para Chrome Mobile, Brave Mobile y Android
      const timer = setTimeout(() => setShowPrompt(true), 7000);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [pathname]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      // Instrucción general para navegadores móviles donde no se puede invocar el prompt programático (Chrome/Brave)
      alert("Para instalar en Android / Chrome / Brave: Toca el menú de tres puntos (⋮) de tu navegador y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    sessionStorage.setItem("pwa_dismissed", "true");
    setShowPrompt(false);
  };

  // Ocultar si está en Admin o si ya está instalada
  if (!showPrompt || installed || (pathname && pathname.startsWith("/admin"))) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white/95 dark:bg-[#181922]/95 backdrop-blur-md p-4.5 rounded-3xl border-2 border-pink-200 dark:border-pink-900/50 shadow-2xl shadow-pink-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF97A4] to-[#be185d] p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <img src="/logo.jpg" alt="Gabriela's Flowers App" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div>
              <h4 className="font-serif font-black text-sm text-[#1A1C1C] dark:text-white leading-snug flex items-center gap-1">
                Gabriela's Flowers App <Sparkles size={13} className="text-[#FF97A4]" />
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                ¡Instala la App oficial en tu celular! 📱
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {isIOS ? (
          <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-2xl text-[11px] text-pink-950 dark:text-pink-200 flex items-center gap-2 border border-pink-200 dark:border-pink-900/50 font-medium">
            <Share size={16} className="text-[#be185d] flex-shrink-0" />
            <span>
              Para iPhone/iPad (Safari): Toca <strong>Compartir</strong> <Share size={12} className="inline mx-0.5" /> y selecciona <strong>"Agregar al inicio"</strong>.
            </span>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-[#FF97A4] to-[#be185d] hover:from-[#be185d] hover:to-[#831843] text-white py-3 px-4 rounded-2xl font-bold text-xs shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span>Instalar App en 1 Tap (Gratis)</span>
          </button>
        )}
      </div>
    </div>
  );
}
