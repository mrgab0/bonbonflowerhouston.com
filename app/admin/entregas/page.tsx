"use client";

import { useEffect, useState } from "react";
import { getDeliveryOptions, updateDeliveryOption } from "@/lib/actions/delivery";
import { DEFAULT_DELIVERY_OPTIONS, DeliveryOption } from "@/lib/deliveryOptions";
import { Truck, Save, Clock, DollarSign, Tag, CheckCircle2, RefreshCw, Route, Info } from "lucide-react";

export default function DeliveryAdminPage() {
  const [options, setOptions] = useState<DeliveryOption[]>(DEFAULT_DELIVERY_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveryOptions();
  }, []);

  async function loadDeliveryOptions() {
    setLoading(true);
    const { data } = await getDeliveryOptions();
    if (data && data.length > 0) {
      setOptions(data);
    }
    setLoading(false);
  }

  async function handleSave(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingId(id);

    const formData = new FormData(e.currentTarget);
    const result = await updateDeliveryOption(id, formData);

    setSavingId(null);
    if (result.success) {
      setSavedSuccess(id);
      setTimeout(() => setSavedSuccess(null), 3000);
      loadDeliveryOptions();
    } else {
      alert("Error al actualizar la opción de entrega.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-2xl border border-gray-100 dark:border-stone-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white">Gestión de Opciones y Tarifas de Entrega</h1>
          <p className="text-xs text-gray-500 dark:text-stone-400 mt-1">
            Configura el costo por milla y tiempos estimados. El costo de entrega se cobra <strong>exclusivamente por milla recorrida (Millas × $/milla)</strong> sin costos base.
          </p>
        </div>
        <button
          onClick={loadDeliveryOptions}
          className="bg-gray-100 dark:bg-stone-800 text-gray-700 dark:text-stone-300 px-4 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Recargar Opciones
        </button>
      </div>

      {/* Nota Informativa */}
      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40 flex items-start gap-3">
        <Info size={18} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 dark:text-purple-200 space-y-1">
          <p className="font-bold">Fórmula de Cobro Automática en el Checkout:</p>
          <p className="text-purple-700 dark:text-purple-300 font-medium">
            El cliente verá la fórmula exacta desglosada en tiempo real: <code className="bg-white/80 dark:bg-stone-900 px-2 py-0.5 rounded font-mono font-bold">📍 [Millas] mi × $[Tarifa]/mi = $[Total]</code>. Los precios base han sido desactivados.
          </p>
        </div>
      </div>

      {/* Lista de Tarjetas Edición Directa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option: any) => (
          <form
            key={option._id || option.id}
            onSubmit={(e) => handleSave(option._id || option.id, e)}
            className="bg-white dark:bg-[#12131A] p-6 rounded-2xl border border-gray-100 dark:border-stone-800 shadow-sm space-y-4 hover:shadow-md transition-all relative"
          >
            {savedSuccess === (option._id || option.id) && (
              <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in duration-300">
                <CheckCircle2 size={14} /> ¡Guardado!
              </div>
            )}

            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-stone-800 pb-3">
              <div className="p-2.5 bg-[#FF97A4]/15 text-[#FF97A4] rounded-xl">
                <Truck size={20} />
              </div>
              <div className="flex-1">
                <input
                  name="title"
                  defaultValue={option.title}
                  placeholder="Nombre de la entrega"
                  className="font-bold text-sm text-[#1A1C1C] dark:text-white border-b border-transparent hover:border-gray-300 dark:hover:border-stone-700 focus:border-[#FF97A4] focus:outline-none w-full bg-transparent"
                  required
                />
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">ID: {option.id || option._id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-600 dark:text-stone-300">Descripción / Detalles de entrega</label>
                <input
                  name="description"
                  defaultValue={option.description}
                  placeholder="Detalles sobre el horario o cobertura..."
                  className="p-2.5 border border-gray-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white dark:bg-stone-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-600 dark:text-stone-300 flex items-center gap-1">
                    <Clock size={12} className="text-[#FF97A4]" /> Tiempo Estimado
                  </label>
                  <input
                    name="estimatedTimeLabel"
                    defaultValue={option.estimatedTimeLabel}
                    placeholder="Ej: 30-45 Minutos, 1 Hora"
                    className="p-2.5 border border-gray-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white dark:bg-stone-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-600 dark:text-stone-300 flex items-center gap-1">
                    <Route size={12} className="text-purple-600" /> Tarifa por Milla ($/milla)
                  </label>
                  <input
                    name="pricePerMile"
                    type="number"
                    step="0.01"
                    defaultValue={option.pricePerMile || 0}
                    placeholder="1.50"
                    className="p-2.5 border rounded-xl font-bold text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-600 dark:text-stone-300 flex items-center gap-1">
                  <Tag size={12} className="text-[#FF97A4]" /> Insignia / Badge Flotante (Opcional)
                </label>
                <input
                  name="badge"
                  defaultValue={option.badge || ""}
                  placeholder="Ej: Ultra Rápido ⚡, Recomendado 🔥, Popular"
                  className="p-2.5 border border-gray-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white dark:bg-stone-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-stone-800">
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                📍 Cobro: Millas × ${Number(option.pricePerMile || 0).toFixed(2)}/mi
              </span>

              <button
                type="submit"
                disabled={savingId === (option._id || option.id)}
                className="bg-[#FF97A4] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#B0004A] transition-colors shadow-sm disabled:bg-gray-400 flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={14} />
                {savingId === (option._id || option.id) ? "Guardando..." : "Guardar Opción"}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
