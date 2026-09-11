"use client";

import { useState } from "react";
import { loginAdminAction } from "@/lib/adminAuth";
import { verify2FACodeAction, sendEmergencyRescueOtpAction, verifyEmergencyRescueOtpAction } from "@/lib/actions/admin2fa";
import { Lock, Eye, EyeOff, ShieldCheck, Flower2, ArrowRight, Key, Smartphone, Mail, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminLoginPage() {
  const [step, setStep] = useState<"password" | "2fa" | "rescue">("password");
  const [twoFactorMode, setTwoFactorMode] = useState<"pin" | "totp">("pin");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rescueCode, setRescueCode] = useState("");
  const [sendingRescue, setSendingRescue] = useState(false);

  // Paso 1: Verificación de Contraseña Principal
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    setLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Error al iniciar sesión.");
      return;
    }

    if (result.require2FA && result.twoFactorMode) {
      setTwoFactorMode(result.twoFactorMode);
      setStep("2fa");
    } else {
      window.location.href = "/admin";
    }
  }

  // Paso 2: Verificación de Código 2FA (PIN o App TOTP)
  async function handle2FASubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!twoFactorCode.trim()) return;

    setLoading(true);
    setErrorMsg("");

    const result = await verify2FACodeAction(twoFactorCode);
    setLoading(false);

    if (result.success) {
      window.location.href = "/admin";
    } else {
      setErrorMsg(result.error || "Código 2FA incorrecto.");
    }
  }

  // Enviar Código de Rescate por Email de Emergencia
  async function handleRequestRescueEmail() {
    setSendingRescue(true);
    setErrorMsg("");
    setInfoMsg("");

    const result = await sendEmergencyRescueOtpAction();
    setSendingRescue(false);

    if (result.success) {
      setInfoMsg(result.message || "Se envió el código de rescate de 6 dígitos a tu correo.");
      setStep("rescue");
    } else {
      setErrorMsg(result.error || "No se pudo enviar el correo de emergencia.");
    }
  }

  // Verificar Código OTP de Rescate por Email
  async function handleRescueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rescueCode.trim()) return;

    setLoading(true);
    setErrorMsg("");

    const result = await verifyEmergencyRescueOtpAction(rescueCode);
    setLoading(false);

    if (result.success) {
      window.location.href = "/admin";
    } else {
      setErrorMsg(result.error || "Código de rescate incorrecto o expirado.");
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1C1C] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-6 relative overflow-hidden">
        
        {/* Paso 1: Formulario de Contraseña Principal */}
        {step === "password" && (
          <>
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
                    className="w-full p-4 pr-12 border-2 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 transition-all"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 italic text-right pt-0.5">
                  Contraseña inicial: <strong className="text-gray-600">flores2026</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF97A4] text-white py-4 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-all shadow-lg shadow-[#FF97A4]/20 disabled:bg-gray-300 flex items-center justify-center gap-2"
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
          </>
        )}

        {/* Paso 2: Verificación de 2FA (PIN o App TOTP) */}
        {step === "2fa" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl mx-auto flex items-center justify-center border border-purple-100 shadow-inner">
                {twoFactorMode === "pin" ? <Key size={28} /> : <Smartphone size={28} />}
              </div>
              <h1 className="text-2xl font-serif font-black text-[#1A1C1C]">Verificación en 2 Pasos (2FA)</h1>
              <p className="text-xs text-gray-500 font-medium">
                {twoFactorMode === "pin"
                  ? "Ingresa tu PIN de Seguridad Maestro de 6 dígitos"
                  : "Abre Google Authenticator o Authy e ingresa el código de 6 dígitos"}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 text-center font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full p-4 border-2 rounded-2xl text-center font-mono text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length < 6}
                className="w-full bg-[#1A1C1C] text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-all shadow-md disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {loading ? "Verificando 2FA..." : "Confirmar e Ingresar 🔓"}
              </button>
            </form>

            {/* Enlace de Emergencia: Recuperación por Email */}
            <div className="pt-3 border-t text-center space-y-2">
              <button
                type="button"
                onClick={handleRequestRescueEmail}
                disabled={sendingRescue}
                className="text-xs text-[#FF97A4] font-bold hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <Mail size={14} />
                {sendingRescue ? "Enviando correo de auxilio..." : "¿Problemas con tu 2FA? Enviar Código de Rescate por Email"}
              </button>
              <button
                type="button"
                onClick={() => setStep("password")}
                className="text-[11px] text-gray-400 font-medium hover:underline block mx-auto"
              >
                Volver a ingresar contraseña
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Rescate por Correo de Emergencia */}
        {step === "rescue" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-pink-50 text-[#FF97A4] rounded-2xl mx-auto flex items-center justify-center border border-pink-100 shadow-inner">
                <Mail size={28} />
              </div>
              <h1 className="text-2xl font-serif font-black text-[#1A1C1C]">Rescate de Emergencia 🔑</h1>
              <p className="text-xs text-gray-500 font-medium">
                Hemos enviado un código especial de 6 dígitos a tu correo oficial. Revisa tu bandeja de entrada o spam.
              </p>
            </div>

            {infoMsg && (
              <div className="bg-green-50 text-green-700 text-xs p-3 rounded-2xl border border-green-200 text-center font-bold">
                {infoMsg}
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 text-center font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRescueSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="text"
                  maxLength={6}
                  value={rescueCode}
                  onChange={(e) => setRescueCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="0 0 0 0 0 0"
                  className="w-full p-4 border-2 border-pink-300 rounded-2xl text-center font-mono text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-[#FF97A4]"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || rescueCode.length < 6}
                className="w-full bg-[#FF97A4] text-white py-4 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-all shadow-md disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {loading ? "Validando Rescate..." : "Ingreso de Emergencia 🚀"}
              </button>
            </form>

            <div className="pt-2 text-center flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleRequestRescueEmail}
                disabled={sendingRescue}
                className="text-gray-500 font-bold hover:text-[#FF97A4] flex items-center gap-1"
              >
                <RefreshCw size={12} /> Reenviar Correo
              </button>

              <button
                type="button"
                onClick={() => setStep("password")}
                className="text-gray-400 font-medium hover:underline"
              >
                Cancelar y Volver
              </button>
            </div>
          </div>
        )}

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
