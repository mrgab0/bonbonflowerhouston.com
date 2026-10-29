"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Home, Truck } from "lucide-react";
import { OrderSummary } from "@/components/shop/OrderSummary";
import { PrintInvoiceClientButton } from "@/components/shop/PrintInvoiceClientButton";
import { getClientPreferredLanguage } from "@/lib/posPrinterClient";

interface CheckoutConfirmationClientProps {
  orderId: string;
  order: any | null;
  locale?: string;
}

export function CheckoutConfirmationClient({
  orderId,
  order,
  locale,
}: CheckoutConfirmationClientProps) {
  const [lang, setLang] = useState<"es" | "en">(
    locale === "es" ? "es" : "en"
  );

  useEffect(() => {
    if (locale === "en") {
      setLang("en");
    } else if (locale === "es") {
      setLang("es");
    } else {
      setLang(getClientPreferredLanguage());
    }
  }, [locale]);

  const isEn = lang === "en";

  const waText = isEn
    ? `Hello! I have placed order ${orderId}. I would like to confirm the details.`
    : `Hola! He finalizado mi pedido ${orderId}. Quisiera confirmar los detalles.`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] dark:bg-[#0B0C10] p-4 sm:p-6 transition-colors duration-300">
      <div className="bg-white dark:bg-[#12131A] p-6 sm:p-10 md:p-12 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-500 max-w-lg w-full">
        <div className="bg-emerald-100 dark:bg-emerald-950/60 p-4 rounded-full text-emerald-600 dark:text-emerald-400 mb-6 animate-bounce mx-auto w-20 h-20 flex items-center justify-center">
          <CheckCircle2 size={44} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1C1C] dark:text-white mb-2 tracking-tight">
          {isEn ? "Order Completed! 🌹" : "¡Compra Finalizada! 🌹"}
        </h2>
        <p className="text-gray-500 dark:text-stone-400 text-sm mb-6 max-w-md mx-auto">
          {isEn
            ? "Your order has been received. Thank you for choosing Bonbon Flowers Houston."
            : "Pronto recibirás tu pedido. Gracias por elegir Bonbon Flowers Houston."}
        </p>

        <div className="bg-gray-50 dark:bg-stone-900/90 border border-gray-100 dark:border-stone-800 p-4 rounded-2xl mb-6">
          <p className="text-xs text-gray-500 dark:text-stone-400 uppercase tracking-widest font-bold">
            {isEn ? "Order Number" : "Número de Pedido"}
          </p>
          <p className="text-2xl font-mono font-black text-[#D81B60] dark:text-[#FF97A4] mt-1">
            {orderId}
          </p>
        </div>

        {order && (
          <div className="space-y-4 mb-6">
            <OrderSummary items={order.items || []} lang={lang} />
            <PrintInvoiceClientButton
              order={order}
              lang={lang}
              variant="outline"
              className="w-full"
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/13467392730?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>{isEn ? "Confirm via WhatsApp" : "Contactar por WhatsApp"}</span>
          </a>

          <Link
            href={isEn ? "/rastreo" : "/es/rastreo"}
            className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all"
          >
            <Truck size={18} className="text-[#FF97A4]" />
            <span>{isEn ? "Track My Order" : "Rastrear Pedido"}</span>
          </Link>

          <Link
            href={isEn ? "/" : "/es"}
            className="flex items-center justify-center gap-2 bg-[#1A1C1C] dark:bg-black hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all"
          >
            <Home size={18} />
            <span>{isEn ? "Back to Boutique Home" : "Volver al Inicio"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
