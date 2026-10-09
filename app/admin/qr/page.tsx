"use client";

import React, { useState } from "react";
import { QrCode, Zap, Layers, Sparkles } from "lucide-react";
import { StaticQrEditor } from "@/components/admin/qr/StaticQrEditor";
import { DynamicQrEditor } from "@/components/admin/qr/DynamicQrEditor";

export default function AdminQrPage() {
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-[#FF97A4] to-[#B0004A] text-white rounded-xl shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                Estudio & Creador de Códigos QR
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Diseña códigos QR estéticos de alta calidad para tarjetas florales, cintas, WhatsApp y promociones.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-gray-200/70 dark:bg-gray-800/80 rounded-2xl shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("static")}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "static"
                ? "bg-white dark:bg-[#1A1D24] text-[#B0004A] dark:text-pink-400 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            QR Estático
          </button>

          <button
            onClick={() => setActiveTab("dynamic")}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "dynamic"
                ? "bg-white dark:bg-[#1A1D24] text-[#B0004A] dark:text-pink-400 shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" />
            QR Dinámico (Rastreado)
          </button>
        </div>
      </div>

      {/* Tab Description Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/70 via-white to-emerald-50/40 dark:from-[#1A1D24] dark:via-[#16181F] dark:to-[#1A1D24] border border-pink-100/60 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        {activeTab === "static" ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#B0004A] dark:text-pink-400 flex items-center gap-1">
              <Zap className="w-4 h-4" /> Modo Estático:
            </span>
            <span>
              Generación inmediata para WhatsApp, enlaces directos, vCards o mensajes florales. No caduca ni depende de bases de datos.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Layers className="w-4 h-4" /> Modo Dinámico:
            </span>
            <span>
              Crea enlaces cortos vinculados a tu dominio. Puedes cambiar el enlace de destino en el futuro sin tener que reimprimir las tarjetas de flores.
            </span>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div>
        {activeTab === "static" ? <StaticQrEditor /> : <DynamicQrEditor />}
      </div>
    </div>
  );
}
