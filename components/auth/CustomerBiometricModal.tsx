"use client";

import { useState, useEffect } from "react";
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import {
  generatePasskeyRegistrationOptionsAction,
  verifyPasskeyRegistrationAction,
  generatePasskeyAuthenticationOptionsAction,
  verifyPasskeyAuthenticationAction
} from "@/lib/actions/customerAuth";
import { Fingerprint, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, X, Lock, Zap } from "lucide-react";

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerData: any) => void;
}

export function CustomerBiometricModal({ isOpen, onClose, onSuccess }: BiometricModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
    const savedEmail = localStorage.getItem("customerEmail") || "";
    const savedName = localStorage.getItem("customerName") || "";
    const savedPhone = localStorage.getItem("customerPhone") || "";

    if (savedEmail) setEmail(savedEmail);
    if (savedEmail || savedName || savedPhone) setHasSavedData(true);
  }, [isOpen]);

  if (!isOpen) return null;

  const getClientHostname = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  // Autocompletado Mágico en 1 Tap de datos de sesión recordados en este celular
  const handleQuickAutocomplete = () => {
    const savedEmail = localStorage.getItem("customerEmail") || email;
    const savedName = localStorage.getItem("customerName") || "";
    const savedPhone = localStorage.getItem("customerPhone") || "";
    const savedAddress = localStorage.getItem("customerAddress") || "";

    setMessage({ type: "success", text: "¡Datos de cliente autocompletados con éxito!" });
    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          email: savedEmail,
          name: savedName,
          phone: savedPhone,
          address: savedAddress
        });
      }
      onClose();
    }, 600);
  };

  // 1. Iniciar Sesión con Huella / Face ID Existente
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Por favor ingresa tu correo electrónico." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Activando lector de huella dactilar de tu teléfono..." });

    try {
      const clientHost = getClientHostname();
      const resOptions = await generatePasskeyAuthenticationOptionsAction(email.trim(), clientHost);

      if (!resOptions.success) {
        if (resOptions.needRegistration) {
          setMessage({
            type: "info",
            text: "Aún no tienes activada tu huella en este correo. Toca '✨ Activar mi Huella en este Celular'."
          });
        } else {
          setMessage({ type: "error", text: resOptions.error || "Error al preparar sensor biométrico." });
        }
        setLoading(false);
        return;
      }

      const authResp = await startAuthentication(resOptions.options as any);
      const verifyRes = await verifyPasskeyAuthenticationAction(email.trim(), authResp, clientHost);
      setLoading(false);

      if (verifyRes.success && verifyRes.customer) {
        setMessage({ type: "success", text: "¡Huella verificada correctamente! Cargando datos..." });
        
        localStorage.setItem("customerEmail", verifyRes.customer.email);
        if (verifyRes.customer.name) localStorage.setItem("customerName", verifyRes.customer.name);
        if (verifyRes.customer.phone) localStorage.setItem("customerPhone", verifyRes.customer.phone);

        setTimeout(() => {
          if (onSuccess) onSuccess(verifyRes.customer);
          onClose();
        }, 1000);
      } else {
        setMessage({ type: "error", text: verifyRes.error || "Fallo al validar la huella." });
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setMessage({ type: "error", text: "Verificación de huella cancelada." });
      } else {
        setMessage({ type: "error", text: "Si es tu primera vez, presiona '✨ Activar mi Huella en este Celular'." });
      }
    }
  };

  // 2. Registrar Huella / Face ID por Primera Vez
  const handleRegister = async () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Ingresa tu correo para activar tu huella." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Activando lector de huella... Toca el sensor biométrico de tu teléfono." });

    try {
      const clientHost = getClientHostname();
      const resOptions = await generatePasskeyRegistrationOptionsAction(email.trim(), clientHost);

      if (!resOptions.success || !resOptions.options) {
        setMessage({ type: "error", text: resOptions.error || "No se pudo preparar el registro." });
        setLoading(false);
        return;
      }

      const regResp = await startRegistration(resOptions.options as any);
      const verifyRes = await verifyPasskeyRegistrationAction(email.trim(), regResp, clientHost);
      setLoading(false);

      if (verifyRes.success && verifyRes.customer) {
        setMessage({ type: "success", text: "¡Huella registrada con éxito! Tus futuras compras serán de 1 segundo." });
        localStorage.setItem("customerEmail", verifyRes.customer.email);

        setTimeout(() => {
          if (onSuccess) onSuccess(verifyRes.customer);
          onClose();
        }, 1200);
      } else {
        setMessage({ type: "error", text: verifyRes.error || "No se pudo registrar la huella." });
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setMessage({ type: "error", text: "Registro biométrico cancelado." });
      } else {
        handleQuickAutocomplete();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12131A] w-full max-w-md p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icono Principal de Huella Dactilar */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 to-[#FF97A4] text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Fingerprint size={42} className="animate-pulse" />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-[#12131A]">
              <Lock size={12} />
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-serif font-black text-[#1A1C1C] dark:text-white flex items-center justify-center gap-2">
              Acceso Rápido con Huella
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Completa tu compra de inmediato en Android, iPhone y Navegadores
            </p>
          </div>
        </div>

        {/* Mensaje de Estado */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                : message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Opción Destacada de Autocompletado Mágico de 1-Tap */}
        {hasSavedData && (
          <button
            type="button"
            onClick={handleQuickAutocomplete}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 border border-emerald-500"
          >
            <Zap size={16} />
            <span>Autocompletar Mis Datos en 1 Tap ✨</span>
          </button>
        )}

        {!isSupported ? (
          <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-amber-200 text-center">
            Tu navegador prefiere autocompletado en 1 Tap. Presiona el botón verde de arriba.
          </div>
        ) : (
          <form onSubmit={handleAuthenticate} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Tu Correo Electrónico:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full p-3.5 border rounded-2xl text-sm font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            {/* Botón Principal: Escanear Huella */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300"
            >
              <Fingerprint size={20} />
              <span>{loading ? "Activando Sensor..." : "👆 Escanear Huella e Ingresar"}</span>
            </button>

            {/* Botón Secundario: Activar Huella en este Celular */}
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
              <span>✨ Activar mi Huella en este Celular (Primera Vez)</span>
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Autenticación Rápida & Encriptada en Tu Dispositivo
          </span>
        </div>
      </div>
    </div>
  );
}
