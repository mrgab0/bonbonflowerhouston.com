"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const CookieConsent = () => {
  const pathname = usePathname();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    // Verificamos si el usuario ya ha aceptado las cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, [pathname]);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowConsent(false);
  };

  if (pathname?.startsWith("/admin") || !showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#1A1C1C] text-white p-6 shadow-2xl border-t border-gray-800">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-gray-300">
          Utilizamos cookies para mejorar su experiencia de boutique digital y gestionar su sesión. 
          Al continuar navegando, acepta nuestra política de privacidad.
        </p>
        <button
          onClick={acceptCookies}
          className="relative bg-[#8B0024] hover:bg-[#2a0002] text-white px-8 py-3 rounded-full font-bold text-sm transition-all whitespace-nowrap shadow-lg border border-[#D4AF37]/40"
        >
          Aceptar Cookies
        </button>
      </div>
    </div>
  );
};

