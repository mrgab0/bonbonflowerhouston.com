"use client";

import { useEffect, useRef } from "react";
import { Star, ShieldCheck, CheckCircle2, Quote } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReviewsSectionProps {
  title?: string;
  ratingScore?: string;
  countText?: string;
  trustpilotWidgetHtml?: string;
}

export function ReviewsSection({
  title,
  ratingScore,
  countText,
  trustpilotWidgetHtml,
}: ReviewsSectionProps) {
  const t = useTranslations("Reviews");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trustpilotWidgetHtml || !widgetRef.current) return;

    // Ejecutar de forma segura scripts incrustados de Trustpilot en React / Next.js
    const container = widgetRef.current;
    container.innerHTML = trustpilotWidgetHtml;

    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [trustpilotWidgetHtml]);

  const reviewsList = [
    {
      id: 1,
      name: t("rev1Name"),
      location: t("rev1Location"),
      rating: 5,
      date: t("rev1Date"),
      comment: t("rev1"),
      verified: true,
    },
    {
      id: 2,
      name: t("rev2Name"),
      location: t("rev2Location"),
      rating: 5,
      date: t("rev2Date"),
      comment: t("rev2"),
      verified: true,
    },
    {
      id: 3,
      name: t("rev3Name"),
      location: t("rev3Location"),
      rating: 5,
      date: t("rev3Date"),
      comment: t("rev3"),
      verified: true,
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#12131A] border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        
        {/* Encabezado Principal de Reseñas */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] border border-pink-200 dark:border-pink-900/50 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{t("badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1A1C1C] dark:text-white tracking-tight">
            {title || t("title")}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" stroke="none" />
              ))}
            </div>
            <span className="text-base font-extrabold text-[#1A1C1C] dark:text-white">{ratingScore || t("score")}</span>
            <span className="text-xs font-bold text-gray-400">•</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
              {countText || t("countText")}
            </span>
          </div>
        </div>

        {/* Si el administrador colocó un código incrustado de Trustpilot o Google Reviews */}
        {trustpilotWidgetHtml && trustpilotWidgetHtml.trim() ? (
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-inner flex justify-center">
            <div
              ref={widgetRef}
              className="w-full flex justify-center [&>iframe]:max-w-full"
            />
          </div>
        ) : null}

        {/* Tarjetas de Testimonios Verificados de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F9F9F9] dark:bg-gray-900/70 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <Quote size={32} className="absolute right-5 top-5 text-pink-200 dark:text-pink-950/40 pointer-events-none" />

              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" stroke="none" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-[#1A1C1C] dark:text-white flex items-center gap-1.5">
                    {rev.name}
                    {rev.verified && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        <CheckCircle2 size={10} /> {t("verifiedPurchase")}
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-medium">{rev.location}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
