"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Check, Tag, Sparkles, ArrowRight } from "lucide-react";

interface HeroImageCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  locale?: string;
  couponCode?: string;
  discountPercent?: number;
}

export const HeroImageCouponModal: React.FC<HeroImageCouponModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Pink & Sunshine Luxury Bouquet",
  locale = "es",
  couponCode = "CODIGO15",
  discountPercent = 15,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const isSpanish = locale === "es";

  // Cerrar con tecla Escape y bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      let copiedSuccessfully = false;
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(couponCode);
          copiedSuccessfully = true;
        } catch {
          // Fallback para entornos donde clipboard API requiere foco o permisos adicionales
        }
      }

      if (!copiedSuccessfully) {
        const textArea = document.createElement("textarea");
        textArea.value = couponCode;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn("Aviso al copiar cupón:", err);
    } finally {
      setCopied(true);
      setShowTooltip(true);

      // Ocultar tooltip después de 3.5 segundos
      setTimeout(() => {
        setShowTooltip(false);
      }, 3500);

      // Reestablecer texto copiado tras 5 segundos
      setTimeout(() => {
        setCopied(false);
      }, 5000);
    }
  };

  const handleExploreCollection = () => {
    onClose();
    const catalogElem = document.getElementById("catalogo");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "catalogo";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isSpanish ? "Cupón de Descuento Especial" : "Special Discount Coupon"}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#13151b] rounded-3xl overflow-hidden shadow-2xl border border-pink-200/60 dark:border-pink-900/40 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
        {/* Botón de Cierre Circular */}
        <button
          onClick={onClose}
          aria-label={isSpanish ? "Cerrar ventana" : "Close window"}
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. SECCIÓN SUPERIOR: LIGHTBOX DE LA IMAGEN */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[36dvh] bg-stone-900 overflow-hidden group">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay gradiente suave inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Badges Flotantes sobre la Imagen */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="inline-flex items-center gap-1 bg-[#1b4332]/90 backdrop-blur-md text-[#E6C98B] text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#E6C98B]/30 shadow-md">
              <Sparkles className="w-3 h-3 text-[#E6C98B]" />
              <span>{isSpanish ? "ALTA COSTURA FLORAL" : "HAUTE COUTURE FLORAL"}</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-[#c71f37]/90 backdrop-blur-md text-white text-[9.5px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
              <span>{discountPercent}% OFF</span>
            </span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#ffccd5]">
              ART FLORAL • HOUSTON
            </p>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white leading-tight drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>

        {/* 2. CONTENIDO EDITORIAL & TARJETA DE CUPÓN INTERACTIVA */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="text-center space-y-1">
            <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              {isSpanish ? "¡Regala Momentos Inolvidables!" : "Flowers that make them feel loved ♡"}
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
              {isSpanish
                ? `Aprovecha un ${discountPercent}% de descuento especial en arreglos de diseño exclusivo con entrega el mismo día en Houston.`
                : `Enjoy a special ${discountPercent}% discount on exclusive designer arrangements with same-day delivery in Houston.`}
            </p>
          </div>

          {/* TARJETA DE CUPÓN INTERACTIVA CON TOOLTIP */}
          <div className="relative">
            {/* Tooltip Animado Flotante */}
            {showTooltip && (
              <div
                className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-[#92C21E]/50 whitespace-nowrap"
                role="status"
                aria-live="polite"
              >
                <Check className="w-4 h-4 text-[#92C21E] stroke-[3]" />
                <span>{isSpanish ? "¡Código de cupón copiado!" : "Coupon code copied!"}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className={`w-full text-left relative p-3.5 sm:p-4 rounded-2xl border-2 border-dashed transition-all duration-300 group cursor-pointer ${
                copied
                  ? "border-[#1b4332] bg-[#f0f9f4] dark:bg-emerald-950/30 ring-2 ring-[#1b4332]/20"
                  : "border-pink-300 dark:border-pink-800 bg-[#fff5f6] dark:bg-pink-950/20 hover:border-[#b8335b] hover:bg-pink-50/80 dark:hover:bg-pink-950/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      copied
                        ? "bg-[#1b4332] text-[#92C21E]"
                        : "bg-[#fae1df] dark:bg-pink-900/50 text-[#933c4f] dark:text-pink-300 group-hover:scale-105"
                    }`}
                  >
                    {copied ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Tag className="w-5 h-5" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                      {isSpanish ? "Cupón de Descuento (Toca para copiar)" : "Discount Coupon (Tap to copy)"}
                    </span>
                    <span className="text-xl sm:text-2xl font-mono font-extrabold tracking-wider text-[#1c2e24] dark:text-white">
                      {couponCode}
                    </span>
                  </div>
                </div>

                {/* Botón visual de acción rápida */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    copied
                      ? "bg-[#1b4332] text-white"
                      : "bg-white dark:bg-stone-800 text-[#b8335b] dark:text-pink-300 group-hover:bg-[#b8335b] group-hover:text-white border border-pink-200 dark:border-stone-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#92C21E]" />
                      <span>{isSpanish ? "¡Copiado!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isSpanish ? "Copiar" : "Copy"}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Subtexto explicativo */}
              <div className="mt-2 pt-2 border-t border-pink-200/60 dark:border-pink-900/30 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400">
                <span>{isSpanish ? "Aplica 15% OFF al pagar en Checkout" : "Applies 15% OFF at Checkout"}</span>
                <span className="text-[#933c4f] dark:text-pink-300 font-semibold group-hover:underline">
                  {copied
                    ? isSpanish
                      ? "Listo para pegar en tu orden ✓"
                      : "Ready to paste in your order ✓"
                    : isSpanish
                    ? "Click para copiar código"
                    : "Click to copy code"}
                </span>
              </div>
            </button>
          </div>

          {/* 3. BOTÓN DE ACCIÓN / EXPLORAR CATÁLOGO */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleExploreCollection}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1b4332] hover:bg-[#143326] active:bg-[#0f261c] text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>{isSpanish ? "EXPLORAR COLECCIÓN & USAR CUPÓN" : "SHOP COLLECTION & USE COUPON"}</span>
              <ArrowRight className="w-4 h-4 text-[#E6C98B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
