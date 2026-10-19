"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const isEnglish = pathname.startsWith("/en");

  const toggleLanguage = (targetLocale: "es" | "en") => {
    let newPath = pathname;

    if (pathname.startsWith("/es") || pathname.startsWith("/en")) {
      newPath = pathname.replace(/^\/(es|en)/, `/${targetLocale}`);
    } else {
      newPath = `/${targetLocale}${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div className="flex items-center bg-stone-100 dark:bg-stone-900/90 p-1 rounded-full border border-stone-200 dark:border-stone-800 text-[11px] font-extrabold text-stone-700 dark:text-[#B9E6D3] shadow-inner">
      <button
        type="button"
        onClick={() => toggleLanguage("es")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          !isEnglish
            ? "bg-white dark:bg-[#181922] text-stone-900 dark:text-[#5EEAD4] shadow-sm font-black border border-transparent dark:border-[#5EEAD4]/30"
            : "text-stone-700 dark:text-[#76C7B2] hover:text-[#163422] dark:hover:text-[#5EEAD4] font-bold"
        }`}
        title="Cambiar a Español"
      >
        <span>🇲🇽</span>
        <span>ES</span>
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
          isEnglish
            ? "bg-white dark:bg-[#181922] text-stone-900 dark:text-[#5EEAD4] shadow-sm font-black border border-transparent dark:border-[#5EEAD4]/30"
            : "text-stone-700 dark:text-[#76C7B2] hover:text-[#163422] dark:hover:text-[#5EEAD4] font-bold"
        }`}
        title="Switch to English"
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>
    </div>
  );
}
