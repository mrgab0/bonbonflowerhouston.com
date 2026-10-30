"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";

interface ToolbarProps {
  totalProducts: number;
  totalAddons: number;
  lang: "en" | "es";
}

export function CatalogPrintToolbar({ totalProducts, totalAddons, lang }: ToolbarProps) {
  const [isPreparing, setIsPreparing] = useState(false);

  // Precarga activa en segundo plano al montar la página
  useEffect(() => {
    if (typeof window !== "undefined") {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
      imgs.forEach((img) => {
        if (!img.complete && img.src) {
          const preloader = new Image();
          preloader.src = img.src;
        }
      });
    }
  }, []);

  const handlePrint = async () => {
    setIsPreparing(true);
    try {
      if (typeof window !== "undefined") {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));

        // Garantizar que hasta la última imagen esté descargada antes de invocar window.print()
        await Promise.all(
          imgs.map((img) => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>((resolve) => {
              const onDone = () => resolve();
              img.addEventListener("load", onDone, { once: true });
              img.addEventListener("error", onDone, { once: true });
              // Timeout de seguridad de 3.5 segundos por si una imagen externa tarda
              setTimeout(resolve, 3500);
            });
          })
        );

        // Breve retardo para permitir al rasterizador pintar todos los bitmaps
        await new Promise((r) => setTimeout(r, 400));
        window.print();
      }
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-[#163422] text-white shadow-xl border-b border-[#C5A059]/40 print:hidden transition-all">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalogo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{lang === "es" ? "Ajustes del Catálogo" : "Catalog Settings"}</span>
          </Link>

          <span className="text-white/40 hidden sm:inline">•</span>

          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide text-[#C5A059]">
              BONBON FLOWERS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-mono">
              {totalProducts} {lang === "es" ? "arreglos" : "arrangements"}
              {totalAddons > 0 ? ` + ${totalAddons} ${lang === "es" ? "adicionales" : "add-ons"}` : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-white/70 italic">
            {lang === "es"
              ? "💡 Selecciona 'Guardar como PDF' en tu diálogo de impresión."
              : "💡 Tip: Select 'Save as PDF' in your print dialog."}
          </span>

          <button
            type="button"
            disabled={isPreparing}
            onClick={handlePrint}
            className={`px-5 py-2 rounded-full font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer ${
              isPreparing
                ? "bg-[#C5A059]/80 text-stone-900 cursor-wait"
                : "bg-[#C5A059] text-stone-950 hover:bg-[#d8b56f] hover:scale-105"
            }`}
          >
            {isPreparing ? (
              <>
                <Loader2 size={15} className="animate-spin text-stone-900" />
                <span>{lang === "es" ? "Cargando todas las fotos..." : "Preloading all images..."}</span>
              </>
            ) : (
              <>
                <Printer size={15} />
                <span>{lang === "es" ? "Imprimir / Guardar en PDF" : "Print / Save to PDF"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
