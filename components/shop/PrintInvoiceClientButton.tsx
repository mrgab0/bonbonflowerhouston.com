"use client";

import { useState, useEffect } from "react";
import { FileText, Check, Loader2, Printer } from "lucide-react";
import { printInvoiceA4Direct, POSOrderData, getClientPreferredLanguage } from "@/lib/posPrinterClient";

interface PrintInvoiceClientButtonProps {
  order: POSOrderData | any;
  lang?: "es" | "en";
  className?: string;
  variant?: "solid" | "outline" | "pill";
}

export function PrintInvoiceClientButton({
  order,
  lang,
  className = "",
  variant = "outline",
}: PrintInvoiceClientButtonProps) {
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [detectedLang, setDetectedLang] = useState<"es" | "en">(lang || "es");

  useEffect(() => {
    if (!lang) {
      setDetectedLang(getClientPreferredLanguage());
    } else {
      setDetectedLang(lang);
    }
  }, [lang]);

  if (!order) return null;

  const isEn = detectedLang === "en";

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printInvoiceA4Direct(order, detectedLang);
      setPrinted(true);
      setTimeout(() => setPrinted(false), 3000);
    } catch (e) {
      console.warn("Error al emitir factura:", e);
    } finally {
      setPrinting(false);
    }
  };

  const label = printing
    ? isEn
      ? "Generating Invoice..."
      : "Generando Factura..."
    : printed
    ? isEn
      ? "Invoice Ready! ✓"
      : "¡Factura Lista! ✓"
    : isEn
    ? "Print Official Invoice (PDF)"
    : "Descargar / Imprimir Factura (PDF)";

  let baseStyle =
    "bg-white dark:bg-stone-900 hover:bg-pink-50 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 hover:border-[#FF97A4] shadow-sm";

  if (variant === "solid") {
    baseStyle =
      "bg-stone-900 hover:bg-black text-white shadow-md hover:scale-102";
  } else if (variant === "pill") {
    baseStyle =
      "bg-gradient-to-r from-pink-500/10 to-rose-500/10 hover:from-pink-500/20 hover:to-rose-500/20 text-[#B0004A] dark:text-pink-300 border border-pink-200/80 dark:border-pink-900/50 shadow-xs";
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={printing}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer ${baseStyle} ${className}`}
      title={isEn ? "View, print or download your official invoice as PDF" : "Ver, imprimir o descargar tu factura oficial en PDF"}
    >
      {printing ? (
        <Loader2 size={16} className="animate-spin text-[#FF97A4]" />
      ) : printed ? (
        <Check size={16} className="text-emerald-500" />
      ) : (
        <FileText size={16} className="text-[#FF97A4]" />
      )}
      <span>{label}</span>
    </button>
  );
}
