"use client";

import React from "react";
import Link from "next/link";
import { Truck, Sparkles, ArrowRight, ShieldCheck, Clock, MapPin, MessageCircle } from "lucide-react";

export function DeliveryShowcaseBanners() {
  return (
    <section className="py-14 sm:py-20 relative z-20 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Grilla de 2 Banners Grandes Paralelos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BANNER 1: Demostración de Entrega & Chofer Privado en Houston */}
          <div className="group relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[480px] flex flex-col justify-between p-8 sm:p-10 text-white shadow-2xl border border-white/10">
            {/* Imagen de Fondo con Overlay Oscuro Gradiente */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=1200&auto=format&fit=crop&q=80"
                alt="Entrega de Ramos Gabriela's Flowers"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            </div>

            {/* Badges Superiores */}
            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                <Truck size={13} />
                <span>Entrega Garantizada</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-pink-200">
                <MapPin size={12} />
                <span>Houston & Alrededores</span>
              </span>
            </div>

            {/* Texto y Llamado a la Acción Inferior */}
            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="space-y-2">
                <span className="text-pink-300 text-xs font-black uppercase tracking-[0.2em] block">
                  Experiencia VIP a Domicilio
                </span>
                <h3 className="font-serif font-black text-3xl sm:text-4xl leading-tight tracking-tight">
                  Flores Frescas Entregadas en Tiempo Récord
                </h3>
                <p className="text-sm text-gray-200 font-medium leading-relaxed">
                  Choferes privados dedicados para que tus ramos lleguen hidratados, impecables y con tarjeta caligrafiada personalizada.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/rastreo"
                  className="inline-flex items-center gap-2 bg-white text-[#2B0002] hover:bg-[#FF97A4] hover:text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl active:scale-95"
                >
                  <span>Rastrear Pedido 📦</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-white/30"
                >
                  <span>Ver Catálogo</span>
                </Link>
              </div>
            </div>
          </div>

          {/* BANNER 2: Diseños Personalizados, Eventos & Ramos Monumentales */}
          <div className="group relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[480px] flex flex-col justify-between p-8 sm:p-10 text-white shadow-2xl border border-white/10">
            {/* Imagen de Fondo con Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1200&auto=format&fit=crop&q=80"
                alt="Arreglos Florales Personalizados"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
            </div>

            {/* Badges Superiores */}
            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-[#80273B] text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-md border border-[#D4AF37]/50">
                <Sparkles size={13} className="text-[#D4AF37]" />
                <span>Boutique de Lujo</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-pink-200">
                <ShieldCheck size={12} />
                <span>100% Personalizable</span>
              </span>
            </div>

            {/* Texto y Llamado a la Acción Inferior */}
            <div className="relative z-10 space-y-4 max-w-lg">
              <div className="space-y-2">
                <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em] block">
                  Alta Floristería
                </span>
                <h3 className="font-serif font-black text-3xl sm:text-4xl leading-tight tracking-tight">
                  Diseños Exclusivos Creados a Tu Medida
                </h3>
                <p className="text-sm text-gray-200 font-medium leading-relaxed">
                  ¿Tienes una idea única para un aniversario, propuesta o evento? Nuestras maestras floristas convierten tus sentimientos en arte floral.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/18323911835?text=Hola%20Gabriela's%20Flowers,%20deseo%20un%20arreglo%20floral%20personalizado"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl active:scale-95"
                >
                  <MessageCircle size={15} />
                  <span>Hablar con Florista</span>
                </a>

                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border border-white/30"
                >
                  <span>Explorar Ramos</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
