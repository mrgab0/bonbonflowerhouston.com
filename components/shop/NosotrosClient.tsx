"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Footer } from "@/components/shop/Footer";
import {
  Sparkles,
  Heart,
  Truck,
  ShieldCheck,
  Calendar,
  ArrowRight,
  MessageCircle,
  BookOpen,
  MapPin,
  Clock,
  Gift
} from "lucide-react";

interface NosotrosClientProps {
  initialPosts: any[];
  locale?: string;
}

export function NosotrosClient({ initialPosts = [], locale = "es" }: NosotrosClientProps) {
  const [selectedTag, setSelectedTag] = useState("all");

  const tags = [
    { id: "all", label: "Todos los Artículos" },
    { id: "guias", label: "Guías Florales" },
    { id: "aniversarios", label: "Aniversarios & Amor" },
    { id: "cuidados", label: "Cuidado de Flores" }
  ];

  const filteredPosts = initialPosts.filter((post) => {
    if (selectedTag === "all") return true;
    const search = selectedTag.toLowerCase();
    return (
      post.title?.toLowerCase().includes(search) ||
      post.excerpt?.toLowerCase().includes(search) ||
      post.content?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#0B0C10] text-black dark:text-black flex flex-col transition-colors duration-300">
      <ShopHeader />

      <main className="nosotros-page-root flex-1">
        
        {/* HERO EDITORIAL: HISTORIA DE GABRIELA'S FLOWERS */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-[#fff0ef]/60 via-transparent to-transparent dark:from-[#181922]/60 dark:via-transparent dark:to-transparent border-b border-[#D4AF37]/20">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              
              {/* Kicker */}
              <div className="inline-flex items-center gap-2 bg-[#fff0ef] dark:bg-pink-100 text-black dark:text-black border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                <Sparkles size={13} className="text-[#8B0024]" />
                <span>Boutique Floral & Storytelling</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black !text-black dark:!text-black tracking-tight leading-tight" style={{ color: '#000000' }}>
                Detalles que Enamoran
              </h1>

              {/* Resumen de Historia */}
              <p className="text-base sm:text-lg text-black dark:text-black leading-relaxed font-medium pt-2">
                En <strong className="font-bold text-black dark:text-black">Gabriela's Flowers LLC</strong>, nacimos en Pasadena y Houston, Texas con un solo propósito: transformar cada sentimiento en una obra de arte floral inolvidable. Seleccionamos las rosas y flores más frescas de exportación para confeccionar ramos buchones, cajas de lujo y arreglos exclusivos que celebran la vida, el amor y los momentos que perduran.
              </p>

              <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-black dark:text-black pt-2">
                <span className="flex items-center gap-1 text-black dark:text-black">
                  <MapPin size={15} className="text-[#8B0024]" /> Houston & Pasadena, TX
                </span>
                <span className="text-black dark:text-black">•</span>
                <span className="flex items-center gap-1 text-black dark:text-black">
                  <Clock size={15} className="text-purple-600" /> Entrega el Mismo Día
                </span>
                <span className="text-black dark:text-black">•</span>
                <span className="flex items-center gap-1 text-black dark:text-black">
                  <Heart size={15} className="text-[#8B0024]" /> Floristas Expertos
                </span>
              </div>

            </div>

            {/* 3 PILARES DE LA BOUTIQUE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-14">
              
              <div className="bg-white/80 dark:bg-[#181922]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/25 shadow-[0_4px_20px_rgba(42,0,2,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-[#8B0024] dark:text-[#FF97A4] flex items-center justify-center mb-4 shadow-sm border border-pink-100 dark:border-pink-900/50">
                  <Heart size={24} />
                </div>
                <h3 className="font-serif font-black text-lg !text-black dark:!text-black mb-2" style={{ color: '#000000' }}>
                  Frescura Incomparable
                </h3>
                <p className="text-xs text-black dark:text-black leading-relaxed font-medium">
                  Rosas y follajes seleccionados a mano todos los días para asegurar pétalos firmes, colores vibrantes y una duración prolongada.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#181922]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/25 shadow-[0_4px_20px_rgba(42,0,2,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4 shadow-sm border border-purple-100 dark:border-purple-900/50">
                  <Sparkles size={24} />
                </div>
                <h3 className="font-serif font-black text-lg !text-black dark:!text-black mb-2" style={{ color: '#000000' }}>
                  Diseño de Alta Floristería
                </h3>
                <p className="text-xs text-black dark:text-black leading-relaxed font-medium">
                  Ramos buchones de impacto, coronas brillantes, mariposas decorativas, cajas redondas de lujo y dedicatorias exclusivas en cada pedido.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-[#181922]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/25 shadow-[0_4px_20px_rgba(42,0,2,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                  <Truck size={24} />
                </div>
                <h3 className="font-serif font-black text-lg !text-black dark:!text-black mb-2" style={{ color: '#000000' }}>
                  Envíos y Puntualidad
                </h3>
                <p className="text-xs text-black dark:text-black leading-relaxed font-medium">
                  Cobertura puntual en Houston, Pasadena, Pearland y zonas vecinas con seguimiento en vivo de tu envío.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* SECCIÓN BLOG EDITORIAL & CONSEJOS FLORALES */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            
            {/* Cabecera del Blog */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-100 text-black dark:text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <BookOpen size={14} className="text-[#8B0024]" />
                  <span>Blog & Consejos Florales</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-black !text-black dark:!text-black" style={{ color: '#000000' }}>
                  Historias, Guías y Tendencias
                </h2>
                <p className="text-sm text-black dark:text-black font-semibold max-w-xl">
                  Aprende a elegir y cuidar tus flores con los consejos de nuestros floristas profesionales en Texas.
                </p>
              </div>

              {/* Filtros de Categorías */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap border ${
                      selectedTag === tag.id
                        ? "bg-[#8B0024] text-white border-[#8B0024] shadow-sm"
                        : "bg-white dark:bg-white text-black dark:text-black border-gray-300 dark:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID DE POSTS */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#181922] rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
                <p className="text-sm font-bold text-black dark:text-black">No hay artículos en esta categoría en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.slug || post._id}
                    className="bg-white dark:bg-[#181922] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Imagen del Post */}
                    <Link href={`/nosotros/${post.slug}`} className="relative h-56 overflow-hidden block bg-gray-100 dark:bg-gray-800">
                      <img
                        src={post.mainImage || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#1A1C1C]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          Boutique Floral
                        </span>
                      </div>
                    </Link>

                    {/* Contenido de la Tarjeta */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-black dark:text-black font-bold">
                          <Calendar size={13} className="text-[#8B0024]" />
                          <span>{new Date(post.createdAt || Date.now()).toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span>3 min de lectura</span>
                        </div>

                        <Link href={`/nosotros/${post.slug}`}>
                          <h3 className="font-serif font-black text-lg !text-black dark:!text-black group-hover:text-[#8B0024] transition-colors line-clamp-2 leading-snug" style={{ color: '#000000' }}>
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-black dark:text-black line-clamp-3 leading-relaxed font-medium">
                          {post.excerpt || post.content?.slice(0, 140)}
                        </p>
                      </div>

                      {/* Botón Leer Más */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Link
                          href={`/nosotros/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-black dark:text-black hover:text-[#8B0024] group-hover:translate-x-1 transition-transform"
                        >
                          <span>Leer Artículo Completo</span>
                          <ArrowRight size={14} className="text-[#8B0024]" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* CTA FINAL DE COMPRA / COTIZACIÓN */}
        <section className="py-14 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 dark:from-[#181922] dark:via-[#20171d] dark:to-[#181922] border-t border-[#D4AF37]/20">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-serif font-black !text-black dark:!text-black" style={{ color: '#000000' }}>
              ¿Deseas Sorprender con un Arreglo Personalizado?
            </h2>
            <p className="text-sm text-black dark:text-black max-w-xl mx-auto font-medium leading-relaxed">
              Conoce nuestro catálogo con entregas en Houston y Pasadena o comunícate directamente con nuestros floristas para diseñar un ramo a tu medida.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
              <Link
                href="/productos"
                className="bg-[#8B0024] hover:bg-[#B0004A] text-white px-7 py-3.5 rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Gift size={16} />
                <span>Explorar Catálogo de Flores</span>
              </Link>
              <a
                href="https://wa.me/18323911835?text=¡Hola!%20Leí%20su%20página%20de%20Nosotros%20y%20quisiera%20cotizar%20un%20arreglo%20floral%20personalizado."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <MessageCircle size={16} />
                <span>Hablar por WhatsApp (+1 832 391-1835)</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
