"use client";

import { useState } from "react";
import { loginAdminAction } from "@/lib/adminAuth";
import { Lock, Eye, EyeOff, ShieldCheck, Flower2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Contraseña incorrecta. Inténtalo de nuevo.");
      return;
    }

    // Redirección inmediata y directa al panel de administración
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-[#1A1C1C] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#FF97A4]/15 text-[#FF97A4] rounded-2xl mx-auto flex items-center justify-center border border-[#FF97A4]/30 shadow-inner">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-serif font-black text-[#1A1C1C]">Acceso al Panel Admin</h1>
          <p className="text-xs text-gray-400 font-medium">
            Ingresa la contraseña de administración para gestionar tu boutique
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 text-center font-bold animate-in fade-in duration-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#FF97A4]" /> Contraseña de Administración
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••"
                className="w-full p-4 pr-12 border-2 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 transition-all text-stone-900"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF97A4] text-white py-4 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-all shadow-lg shadow-[#FF97A4]/20 disabled:bg-gray-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <span>Acceder al Panel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t text-center">
          <a
            href="/"
            className="text-xs font-bold text-gray-400 hover:text-[#FF97A4] transition-colors flex items-center justify-center gap-1.5"
          >
            <Flower2 size={14} /> Volver a la Tienda Pública
          </a>
        </div>
      </div>
    </div>
  );
}
