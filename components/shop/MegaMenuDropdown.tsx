"use client";

import Link from "next/link";
import { Heart, Sparkles, Gift, Flame, ArrowRight, Star, Clock, Gem } from "lucide-react";
import { useTranslations } from "next-intl";

interface MegaMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenuDropdown({ isOpen, onClose }: MegaMenuDropdownProps) {
  const t = useTranslations("nav");

  if (!isOpen) return null;

  const occasions = [
    { name: "Amor & Aniversario", href: "/productos?cat=amor", icon: Heart, badge: "Popular" },
    { name: "Cumpleaños Felices", href: "/productos?cat=cumpleanos", icon: Sparkles },
    { name: "Agradecimiento & Amistad", href: "/productos?cat=agradecimiento", icon: Star },
    { name: "Condolencias & Respeto", href: "/productos?cat=condolencias", icon: Clock },
  ];

  const styles = [
    { name: "Rosas Premium Ecuatorianas", href: "/productos?cat=rosas", icon: Gem, badge: "Top" },
    { name: "Cajas Velvet de Lujo", href: "/productos?cat=cajas", icon: Gift },
    { name: "Bouquets Silvestres Mixtos", href: "/productos?cat=bouquets", icon: Sparkles },
    { name: "Arreglos Gigantes VIP", href: "/productos?cat=vip", icon: Flame, badge: "HOT" },
  ];

  const addOns = [
    { name: "Chocolates Gourmet", href: "/productos?cat=adicionales", tag: "Dulce" },
    { name: "Globos con Helio Personalizados", href: "/productos?cat=adicionales", tag: "Nuevo" },
    { name: "Peluches Gigantes", href: "/productos?cat=adicionales" },
    { name: "Tarjetas Caligrafiadas", href: "/productos?cat=adicionales", tag: "Gratis" },
  ];

  return (
    <div 
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[92vw] max-w-5xl bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/30 dark:border-gray-800 shadow-[0_20px_50px_rgba(42,0,2,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-8 z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Columna 1: Ocasiones */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
            <Heart size={16} className="text-[#8B0024] dark:text-[#FF97A4]" />
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-[#2B0002] dark:text-white">
              Por Ocasión
            </h4>
          </div>
          <ul className="space-y-2.5">
            {occasions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-[#FF97A4] p-1.5 rounded-xl hover:bg-[#fff0ef]/60 dark:hover:bg-gray-800/60 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="text-[#8B0024]/70 dark:text-pink-400 group-hover:scale-110 transition-transform" />
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-[#8B0024] dark:text-pink-300 border border-pink-200 dark:border-pink-800/60">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Columna 2: Estilos & Ramos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
            <Gem size={16} className="text-[#8B0024] dark:text-[#FF97A4]" />
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-[#2B0002] dark:text-white">
              Estilo Floral
            </h4>
          </div>
          <ul className="space-y-2.5">
            {styles.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx}>
                  <Link 
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-[#FF97A4] p-1.5 rounded-xl hover:bg-[#fff0ef]/60 dark:hover:bg-gray-800/60 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="text-[#8B0024]/70 dark:text-pink-400 group-hover:scale-110 transition-transform" />
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${item.badge === "HOT" ? "bg-rose-500 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Columna 3: Adicionales & Extras */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
            <Gift size={16} className="text-[#8B0024] dark:text-[#FF97A4]" />
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-[#2B0002] dark:text-white">
              Complementos
            </h4>
          </div>
          <ul className="space-y-2.5">
            {addOns.map((item, idx) => (
              <li key={idx}>
                <Link 
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-gray-300 hover:text-[#8B0024] dark:hover:text-[#FF97A4] p-1.5 rounded-xl hover:bg-[#fff0ef]/60 dark:hover:bg-gray-800/60 transition-all"
                >
                  <span>🌸 {item.name}</span>
                  {item.tag && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                      {item.tag}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4: Banner Visual de Oferta / Destacado */}
        <div className="relative rounded-2xl overflow-hidden group bg-gradient-to-br from-[#80273B] to-[#2B0002] p-5 text-white flex flex-col justify-between shadow-lg border border-[#D4AF37]/30">
          <div className="relative z-10 space-y-2">
            <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#FF97A4]">
              ✨ Edición Especial
            </span>
            <h5 className="font-serif font-bold text-base leading-snug">
              Ramos de 100 Rosas Rojas de Lujo
            </h5>
            <p className="text-[11px] text-pink-100/80 font-medium">
              Entrega express el mismo día en todo Houston.
            </p>
          </div>

          <Link
            href="/productos"
            onClick={onClose}
            className="mt-4 relative z-10 inline-flex items-center justify-center gap-2 bg-white text-[#2B0002] px-4 py-2.5 rounded-xl text-xs font-black hover:bg-[#FF97A4] hover:text-white transition-all shadow-md active:scale-95"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  );
}
