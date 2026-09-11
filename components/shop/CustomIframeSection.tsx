"use client";

import { Compass, Globe } from "lucide-react";

interface CustomIframeSectionProps {
  title?: string;
  iframeHtml?: string;
}

export function CustomIframeSection({
  title = "Ubicación & Promociones Destacadas",
  iframeHtml,
}: CustomIframeSectionProps) {
  if (!iframeHtml || !iframeHtml.trim()) return null;

  return (
    <section className="py-12 bg-white dark:bg-[#12131A] border-y border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-6 border-b pb-3 border-gray-100 dark:border-gray-800">
          <Globe size={20} className="text-[#FF97A4]" />
          <h2 className="text-xl font-serif font-black text-[#1A1C1C] dark:text-white">
            {title}
          </h2>
        </div>

        {/* Visor de iFrame Responsivo */}
        <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md bg-gray-50 dark:bg-gray-900 min-h-[350px] flex justify-center items-center">
          <div
            className="w-full h-full min-h-[350px] [&>iframe]:w-full [&>iframe]:min-h-[350px] [&>iframe]:border-0 [&>iframe]:rounded-3xl"
            dangerouslySetInnerHTML={{ __html: iframeHtml }}
          />
        </div>
      </div>
    </section>
  );
}
