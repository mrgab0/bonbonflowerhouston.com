"use client";

import { useEffect, useState } from "react";
import { getPaymentConfigs, updatePaymentConfig, togglePaymentActive } from "@/lib/actions/paymentConfig";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { CreditCard, Save, QrCode, CheckCircle2, Copy, Link as LinkIcon, RefreshCw, ArrowLeft, ShieldCheck, DollarSign, Play, Pause, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const PaymentLogos = {
  zelle: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#6d2277"/><path d="M10 5h18v3l-10 8h10v5H10v-3l10-8H10z" fill="#fff"/></svg>,
  cashapp: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#00D632"/><path d="M19 6v12M14 9h7a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  paypal: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#003087"/><path d="M10 5h18v14H10z" fill="#009cde"/></svg>,
  square: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#000000" rx="4"/><rect x="11" y="7" width="16" height="10" rx="2" fill="#fff"/></svg>,
  efectivo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#22C55E" rx="4"/><circle cx="19" cy="12" r="5" fill="#fff"/></svg>
};

export default function AdminPagosPage() {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingMethod, setSavingMethod] = useState<string | null>(null);
  const [togglingMethod, setTogglingMethod] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    setLoading(true);
    const { data } = await getPaymentConfigs();
    if (data) setConfigs(data);
    setLoading(false);
  }

  async function handleSave(methodId: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingMethod(methodId);

    const formData = new FormData(e.currentTarget);
    const result = await updatePaymentConfig(methodId, formData);

    setSavingMethod(null);
    if (result.success) {
      setSavedSuccess(methodId);
      setTimeout(() => setSavedSuccess(null), 3000);
      loadConfigs();
    } else {
      alert("Error al actualizar la información de pago.");
    }
  }

  async function handleToggleActive(methodId: string, currentIsActive: boolean) {
    setTogglingMethod(methodId);
    const result = await togglePaymentActive(methodId, !currentIsActive);
    setTogglingMethod(null);
    if (result.success) {
      loadConfigs();
    } else {
      alert("Error al cambiar estado de publicación.");
    }
  }

  const methodsList = [
    { id: "zelle", name: "Zelle", desc: "Configura el Correo/Teléfono y el Código QR de Zelle" },
    { id: "cashapp", name: "CashApp", desc: "Configura el $Cashtag y el Código QR de CashApp" },
    { id: "paypal", name: "PayPal", desc: "Configura el correo PayPal y enlace paypal.me" },
    { id: "square", name: "Square (Tarjeta)", desc: "Configura el Enlace de Pago Seguro de Square" },
    { id: "efectivo", name: "Efectivo", desc: "Configura las instrucciones de pago en efectivo" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Estilizado Estándar Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C]">Edición de Datos y Códigos QR de Pago</h1>
            <p className="text-xs text-gray-400">Actualiza las cuentas de Zelle, CashApp, PayPal, Square y Efectivo que ven tus clientes en el Checkout</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
      </div>

      {/* Lista de Tarjetas de Configuración por Método */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methodsList.map((m) => {
          const cfg = configs[m.id] || {};
          const isSaving = savingMethod === m.id;
          const isToggling = togglingMethod === m.id;
          const isActive = cfg.isActive !== false; // por defecto activo a menos que sea explícitamente false

          return (
            <form
              key={m.id}
              onSubmit={(e) => handleSave(m.id, e)}
              className={`p-6 rounded-3xl border shadow-sm space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between ${
                isActive ? "bg-white border-gray-100 dark:border-gray-800" : "bg-gray-50/70 dark:bg-[#12131A] border-amber-200 dark:border-amber-900/50 opacity-90"
              }`}
            >
              {savedSuccess === m.id && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in duration-300 shadow-sm z-10">
                  <CheckCircle2 size={14} /> ¡Guardado!
                </div>
              )}

              <div className="space-y-4">
                {/* Cabecera del Método con Insignia de Estado */}
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 border rounded-xl">
                      {PaymentLogos[m.id as keyof typeof PaymentLogos]}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1A1C1C] dark:text-white flex items-center gap-2">
                        <span>{m.name}</span>
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium">{m.desc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {isActive ? "🟢 Publicado en Checkout" : "⚪ Pausado (Oculto)"}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Titular de la Cuenta */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nombre del Titular / Negocio</label>
                    <input
                      name="holderName"
                      defaultValue={cfg.holderName || ""}
                      placeholder="Ej: Gabriela's Flowers LLC"
                      className="p-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    />
                  </div>

                  {/* Correo, Teléfono o $Cashtag */}
                  {m.id !== "efectivo" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {m.id === "zelle" ? "Correo o Teléfono de Zelle *" : m.id === "cashapp" ? "$Cashtag de CashApp *" : m.id === "paypal" ? "Correo de PayPal *" : "Detalle de Cuenta"}
                      </label>
                      <input
                        name="accountDetail"
                        defaultValue={cfg.accountDetail || ""}
                        placeholder={m.id === "zelle" ? "pagos@flowersforyou.com" : m.id === "cashapp" ? "$FlowersShop" : "paypal@flowers.com"}
                        className="p-3 border rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                      />
                    </div>
                  )}

                  {/* Enlace Directo (Square / Paypal.me) */}
                  {(m.id === "square" || m.id === "paypal" || m.id === "cashapp") && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <LinkIcon size={12} className="text-[#FF97A4]" /> Enlace Directo de Pago (URL)
                      </label>
                      <input
                        name="linkUrl"
                        defaultValue={cfg.linkUrl || ""}
                        placeholder={m.id === "square" ? "https://square.link/u/..." : "https://paypal.me/..."}
                        className="p-3 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                      />
                    </div>
                  )}

                  {/* Subida de Imagen QR (ImageKit) */}
                  {m.id !== "efectivo" && m.id !== "square" && (
                    <div className="flex flex-col gap-1 pt-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <QrCode size={14} className="text-[#FF97A4]" /> Imagen del Código QR (ImageKit)
                      </label>
                      <SingleImageUploader
                        name="qrImage"
                        currentImage={cfg.qrImage || ""}
                        defaultValue={cfg.qrImage || ""}
                        label={`Subir Código QR de ${m.name}`}
                      />
                    </div>
                  )}

                  {/* Instrucciones Personalizadas */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Instrucciones Breves para el Cliente</label>
                    <textarea
                      name="instructions"
                      defaultValue={cfg.instructions || ""}
                      placeholder="Instrucciones al cliente al seleccionar este pago..."
                      className="p-3 border rounded-xl text-xs h-20 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de Acción (Pausar/Publicar + Guardar) */}
              <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isToggling}
                  onClick={() => handleToggleActive(m.id, isActive)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isActive
                      ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  }`}
                  title={isActive ? "Pausar este método de pago para que no aparezca en el Checkout" : "Publicar este método de pago para que aparezca en el Checkout"}
                >
                  {isActive ? (
                    <>
                      <Pause size={14} />
                      <span>{isToggling ? "Pausando..." : "Pausar / Ocultar"}</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>{isToggling ? "Publicando..." : "Publicar en Checkout"}</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#FF97A4] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#B0004A] transition-colors shadow-sm disabled:bg-gray-400 flex items-center gap-1.5 ml-auto"
                >
                  <Save size={14} />
                  {isSaving ? "Guardando..." : `Guardar Datos`}
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
