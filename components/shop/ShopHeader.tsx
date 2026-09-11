"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, Fingerprint, Menu, X } from "lucide-react";
import { useCart } from "@/components/shop/Cart/CartContext";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";
import { useTranslations } from "next-intl";

export const ShopHeader = () => {
  const { cartItems } = useCart();
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");

  const navLinks = [
    { href: "/", label: t('home') },
    { href: "/productos", label: t('catalog') },
    { href: "/rastreo", label: t('tracking') },
    { href: "/nosotros", label: t('about') },
    { href: "/contacto", label: t('contact') }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#181922]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4 xl:gap-6 relative">
          {/* Logo Presionable hacia el Home */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-md group-hover:scale-105 group-active:scale-95 transition-transform bg-white p-0.5 flex-shrink-0">
              <img src="/logo.jpg" alt="Gabriela's Flowers Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="hidden xl:block flex-shrink-0">
              <span className="text-lg font-serif font-black text-[#2B0002] dark:text-white tracking-tight group-hover:text-[#FF97A4] transition-colors block">
                Gabriela's <span className="text-[#FF97A4]">Flowers</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block -mt-0.5">
                Boutique Floral
              </span>
            </div>
          </Link>

          {/* Navegación Central (Escritorio) */}
          <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-bold text-[11px] xl:text-xs uppercase tracking-wider 2xl:tracking-[0.15em] px-2 gap-1.5 xl:gap-2 2xl:gap-3 py-2 relative z-0">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx}
                href={link.href} 
                className="px-2.5 xl:px-3.5 2xl:px-4 py-1.5 xl:py-2 2xl:py-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-[#2B0002] dark:text-gray-200 shadow-[0_4px_12px_rgba(42,0,2,0.15)] dark:shadow-none hover:shadow-[0_8px_20px_rgba(42,0,2,0.25)] hover:bg-white dark:hover:bg-gray-700 hover:text-[#8B0025] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 border border-transparent hover:border-[#FF97A4]/30"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Acciones Derecha (Acceso por Huella, Tema, Idioma, Carrito y Toggle Móvil) */}
          <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
            {/* Botón de Acceso Biométrico / Passkeys con Huella */}
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/60 text-[#8B0025] border border-pink-200 dark:border-pink-900 px-2.5 xl:px-3 py-2 rounded-full text-xs font-bold shadow-[0_2px_8px_rgba(42,0,2,0.06)] hover:shadow-[0_6px_16px_rgba(42,0,2,0.12)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              title="Acceso con Huella / Face ID"
            >
              <Fingerprint size={16} />
              <span className="hidden 2xl:inline text-[11px]">Huella 👆</span>
            </button>

            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <ThemeToggle />
            </div>
            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <LanguageSwitcher />
            </div>

            {/* Cart Button indicator */}
            <div className="relative ml-1">
              <Link
                href="/checkout"
                className="flex items-center gap-1.5 xl:gap-2 bg-[#FF97A4] text-white px-2.5 xl:px-3.5 2xl:px-5 py-2 2xl:py-2.5 rounded-full font-bold text-xs hover:bg-[#B0004A] transition-all shadow-md shadow-[#FF97A4]/20"
              >
                <ShoppingCart size={18} />
                <span className="hidden 2xl:inline">Carrito</span>
                {totalCount > 0 && (
                  <span className="bg-[#1A1C1C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {totalCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Botón Toggle de Menú Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-gray-800 text-[#2B0002] dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label={isMobileMenuOpen ? "Contraer menú" : "Desplegar menú"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#181922]/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 text-[#2B0002] dark:text-gray-100 font-bold text-sm shadow-sm active:scale-[0.98] transition-all hover:bg-[#FF97A4]/10 hover:text-[#8B0025] dark:hover:text-[#FF97A4]"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#FF97A4]">→</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Modal Biométrico */}
      <CustomerBiometricModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
      />
    </>
  );
};
