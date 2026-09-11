"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export const WhatsAppButton = ({
  phoneNumber = "18323911835",
  message = "¡Hola! 🌸 Me gustaría recibir asesoría personalizada para elegir el arreglo floral ideal. ¿Me podrían ayudar?",
}: WhatsAppButtonProps) => {
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 sm:bottom-28 right-6 sm:right-8 z-50 flex items-center gap-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white pl-4 pr-6 py-3.5 rounded-full shadow-[0px_10px_30px_rgba(37,211,102,0.4)] hover:scale-105 transition-all duration-300 active:scale-95 group border-2 border-white"
      aria-label="Consulta Floral por WhatsApp"
    >
      <div className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm">
        <MessageCircle size={22} fill="white" className="text-transparent" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[9px] uppercase font-black tracking-widest opacity-90">ASESORÍA VIP</span>
        <span className="text-sm font-extrabold">Consulta Floral</span>
      </div>
    </a>
  );
};
