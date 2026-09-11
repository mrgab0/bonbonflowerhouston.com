"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import dynamic from "next/dynamic";
import { MegaMenuDropdown } from "@/components/shop/MegaMenuDropdown";
import { Fingerprint, Instagram, Facebook, MessageCircle, ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

const CustomerBiometricModal = dynamic(
  () => import("@/components/auth/CustomerBiometricModal").then((m) => m.CustomerBiometricModal),
  { ssr: false }
);

interface StickyNavProps {
  siteConfig?: any;
}

export function StickyNav({ siteConfig }: StickyNavProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 180);
    };
    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const enableSocials = siteConfig?.enableHeaderSocials !== false;
  const instagramUrl = siteConfig?.instagramUrl || "https://instagram.com";
  const facebookUrl = siteConfig?.facebookUrl || "https://facebook.com";
  const tiktokUrl = siteConfig?.tiktokUrl || "https://tiktok.com";
  const whatsappUrl = siteConfig?.whatsappUrl || "https://wa.me/18323911835";

  const navLinks = [
    { href: "/", label: t('home') },
    { href: "/productos", label: t('catalog'), isMega: true },
    { href: "/rastreo", label: t('tracking') },
    { href: "/nosotros", label: t('about') },
    { href: "/contacto", label: t('contact') },
    { href: "/checkout", label: t('cart') }
  ];

  return (
    <>
      <nav
        className={`w-full z-50 transition-all duration-500 border-y border-[#D4AF37]/20 ${
          isSticky
            ? "fixed top-0 bg-[#fff8f7]/95 dark:bg-[#181922]/95 backdrop-blur-lg shadow-[0_10px_30px_rgba(42,0,2,0.08)] py-1"
            : "relative bg-[#fff8f7]/90 dark:bg-[#12131A]/90 backdrop-blur-md py-2"
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 xl:gap-6 relative">
          
          {/* LADO IZQUIERDO: Logo de Gabriela's Flowers SIEMPRE VISIBLE */}
          <div className="flex items-center gap-4 py-2 flex-shrink-0 relative z-10">
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-md group-hover:scale-105 group-active:scale-95 transition-transform bg-white flex-shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Gabriela's Flowers Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif font-black text-lg text-[#2B0002] dark:text-white hidden xl:inline tracking-tight flex-shrink-0">
                Gabriela's <span className="text-[#FF97A4]">Flowers</span>
              </span>
            </Link>

            {enableSocials && (
              <div className="hidden 2xl:flex items-center gap-1 ml-4 pl-4 border-l border-[#D4AF37]/30">
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-rose-700 dark:text-pink-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="Instagram">
                    <Instagram size={15} />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-800 dark:text-blue-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="Facebook">
                    <Facebook size={15} />
                  </a>
                )}
                {tiktokUrl && (
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-800 dark:text-gray-300 hover:text-[#FF97A4] hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md font-extrabold text-[10px]" title="TikTok">
                    🎵
                  </a>
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-700 dark:text-emerald-400 hover:-translate-y-1 active:scale-95 transition-all bg-white/40 dark:bg-gray-800/40 rounded-full shadow-sm hover:shadow-md" title="WhatsApp Directo">
                    <MessageCircle size={15} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CENTRO: Menú de Navegación en Escritorio */}
          <div 
            ref={scrollRef}
            className="hidden lg:flex flex-1 min-w-0 items-center justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-bold text-[11px] xl:text-xs uppercase tracking-wider 2xl:tracking-[0.15em] py-2 gap-1.5 xl:gap-2 2xl:gap-3 px-2 relative z-0"
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            {navLinks.map((link, idx) => (
              <div 
                key={idx} 
                className="relative"
                onMouseEnter={() => link.isMega && setIsMegaMenuOpen(true)}
              >
                <Link 
                  href={link.href} 
                  className="px-2.5 xl:px-3.5 2xl:px-4 py-1.5 xl:py-2 2xl:py-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 text-[#2B0002] dark:text-gray-200 shadow-[0_4px_12px_rgba(42,0,2,0.15)] dark:shadow-none hover:shadow-[0_8px_20px_rgba(42,0,2,0.25)] hover:bg-white dark:hover:bg-gray-700 hover:text-[#8B0025] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300 border border-transparent hover:border-[#FF97A4]/30 inline-flex items-center gap-1"
                >
                  {link.label}
                  {link.isMega && <ChevronDown size={12} className={`transition-transform duration-300 ${isMegaMenuOpen ? "rotate-180" : ""}`} />}
                </Link>
              </div>
            ))}
          </div>

          {/* Mega Menú Flotante */}
          <div onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
            <MegaMenuDropdown 
              isOpen={isMegaMenuOpen} 
              onClose={() => setIsMegaMenuOpen(false)} 
            />
          </div>

          {/* DERECHA: Botones de Control y Toggle Móvil */}
          <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#fff0ef] dark:bg-pink-950/60 text-[#8B0025] border border-[#FF97A4]/40 px-2.5 xl:px-3 py-2 rounded-full text-xs font-bold shadow-[0_2px_8px_rgba(42,0,2,0.06)] hover:shadow-[0_6px_16px_rgba(42,0,2,0.12)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              title="Acceso con Huella / Face ID (Passkeys)"
            >
              <Fingerprint size={14} />
              <span className="hidden 2xl:inline text-[11px]">Huella 👆</span>
            </button>

            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <ThemeToggle />
            </div>
            
            <div className="hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
              <LanguageSwitcher />
            </div>

            {/* Botón de Menú Móvil (Contraer / Desplegar) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-[#2B0002] dark:text-gray-200 border border-[#D4AF37]/30 shadow-sm hover:bg-white dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label={isMobileMenuOpen ? "Contraer menú" : "Desplegar menú"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D4AF37]/20 bg-[#fff8f7]/98 dark:bg-[#181922]/98 backdrop-blur-xl px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 text-[#2B0002] dark:text-gray-100 font-bold text-sm shadow-sm active:scale-[0.98] transition-all hover:bg-[#FF97A4]/10 hover:text-[#8B0025] dark:hover:text-[#FF97A4]"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#FF97A4]">→</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </nav>

      {isBioModalOpen && (
        <CustomerBiometricModal
          isOpen={isBioModalOpen}
          onClose={() => setIsBioModalOpen(false)}
        />
      )}
    </>
  );
}
