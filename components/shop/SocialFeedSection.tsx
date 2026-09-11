"use client";

import { Instagram, Video, Sparkles } from "lucide-react";

interface SocialFeedSectionProps {
  title?: string;
  embedHtml?: string;
}

export function SocialFeedSection({
  title = "Síguenos en Instagram & TikTok 📸",
  embedHtml,
}: SocialFeedSectionProps) {
  if (!embedHtml || !embedHtml.trim()) return null;

  return (
    <section className="py-14 bg-gradient-to-b from-transparent via-pink-50/40 to-transparent dark:via-pink-950/20 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 bg-pink-100 dark:bg-pink-950/60 text-[#FF97A4] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> Feeds & Tendencias en Vivo
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Descubre nuestros últimos diseños florales y momentos especiales capturados en redes sociales.
          </p>
        </div>

        {/* Contenedor Limpio Sanitizado para el Código Incrustado / iFrame de Instagram o TikTok */}
        <div className="bg-white dark:bg-[#12131A] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex justify-center">
          <div
            className="w-full flex justify-center [&>iframe]:max-w-full [&>iframe]:rounded-2xl [&>blockquote]:mx-auto"
            dangerouslySetInnerHTML={{ __html: embedHtml }}
          />
        </div>
      </div>
    </section>
  );
}
