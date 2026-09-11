"use client";

import { useEffect, useState } from "react";
import { getDeliveryOptions, updateDeliveryOption } from "@/lib/actions/delivery";
import { DEFAULT_DELIVERY_OPTIONS, DeliveryOption } from "@/lib/deliveryOptions";
import { Truck, Save, Clock, DollarSign, Tag, CheckCircle2, RefreshCw } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Gestión de Opciones y Horarios de Entrega</h1>
          <p className="text-xs text-gray-400">Configura los precios adicionales, tiempos estimados e insignias para el Checkout</p>
        </div>
        <button
          onClick={loadDeliveryOptions}
          className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Recargar Opciones
        </button>
      </div>

      {/* Lista de Tarjetas Edición Directa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option: any) => (
          <form
            key={option._id || option.id}
            onSubmit={(e) => handleSave(option._id || option.id, e)}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all relative"
          >
            {savedSuccess === (option._id || option.id) && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in duration-300">
                <CheckCircle2 size={14} /> ¡Guardado!
              </div>
            )}

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="p-2.5 bg-[#FF97A4]/15 text-[#FF97A4] rounded-xl">
                <Truck size={20} />
              </div>
              <div>
                <input
                  name="title"
                  defaultValue={option.title}
                  placeholder="Nombre de la entrega"
                  className="font-bold text-sm text-[#1A1C1C] border-b border-transparent hover:border-gray-300 focus:border-[#FF97A4] focus:outline-none w-full"
                  required
                />
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">ID: {option.id || option._id}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-600">Descripción / Detalles de entrega</label>
                <input
                  name="description"
                  defaultValue={option.description}
                  placeholder="Detalles sobre el horario o cobertura..."
                  className="p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-600 flex items-center gap-1">
                    <Clock size={12} className="text-[#FF97A4]" /> Tiempo Estimado
                  </label>
                  <input
                    name="estimatedTimeLabel"
                    defaultValue={option.estimatedTimeLabel}
                    placeholder="Ej: 30-45 Minutos"
                    className="p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-600 flex items-center gap-1">
                    <DollarSign size={12} className="text-[#FF97A4]" /> Precio Base ($ USD)
                  </label>
                  <input
                    name="extraPrice"
                    type="number"
                    step="0.01"
                    defaultValue={option.extraPrice}
                    placeholder="0.00"
                    className="p-2.5 border rounded-xl font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-600 flex items-center gap-1">
                    <DollarSign size={12} className="text-[#FF97A4]" /> Costo por Milla ($/milla)
                  </label>
                  <input
                    name="pricePerMile"
                    type="number"
                    step="0.01"
                    defaultValue={option.pricePerMile || 0}
                    placeholder="1.50"
                    className="p-2.5 border rounded-xl font-bold text-purple-700 bg-purple-50/30 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-600 flex items-center gap-1">
                  <Tag size={12} className="text-[#FF97A4]" /> Insignia / Badge Flotante (Opcional)
                </label>
                <input
                  name="badge"
                  defaultValue={option.badge || ""}
                  placeholder="Ej: Ultra Rápido ⚡, Recomendado 🔥, Gratis"
                  className="p-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingId === (option._id || option.id)}
                className="bg-[#FF97A4] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#B0004A] transition-colors shadow-sm disabled:bg-gray-400 flex items-center gap-1.5"
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
