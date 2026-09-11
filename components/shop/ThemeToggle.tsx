"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        <Sun size={16} />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-slate-900 dark:text-gray-200 hover:text-[#8B0024] dark:hover:text-[#FF97A4] transition-all shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer"
      title={isDark ? "Cambiar a Modo Claro ☀️" : "Cambiar a Modo Oscuro 🌙"}
      aria-label="Alternar tema claro/oscuro"
    >
      {isDark ? (
        <Sun size={17} className="text-amber-500 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon size={17} className="text-slate-900 dark:text-slate-200 animate-in spin-in-90 duration-300" />
      )}
    </button>
  );
}
