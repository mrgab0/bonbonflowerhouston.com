"use client";

import { useState } from "react";
import { getOrderById } from "@/lib/actions/order";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Footer } from "@/components/shop/Footer";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, User, MessageCircle, AlertCircle, Sparkles, Store, Gift } from "lucide-react";

export default function RastreoPedidoPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    const res = await getOrderById(query.trim());
    setLoading(false);

    if (res.success && res.data) {
      setOrder(res.data);
    } else {
      setError("No encontramos ningún pedido con ese ID o teléfono. Verifica los datos e intenta de nuevo.");
    }
  };

  const isPickupOrder = (method: string) => {
    const m = (method || "").toLowerCase();
    return m.includes("pickup") || m.includes("retiro") || m.includes("boutique") || m.includes("tienda");
  };

  const getStatusStep = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("entregado") || s.includes("retirado") || s.includes("delivered") || s.includes("completed")) return 3;
    if (s.includes("en camino") || s.includes("listo para retirar") || s.includes("listo") || s.includes("despachado")) return 2;
    if (s.includes("espera de despacho") || s.includes("en armado") || s.includes("preparando") || s.includes("en diseño")) return 1;
    return 0; // Confirmado / Recibido
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] dark:bg-[#0F1015] text-[#1A1C1C] dark:text-gray-100 flex flex-col">
      <ShopHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-8">
          {/* Header de Rastreo con Ortografía Perfecta */}
          <div className="text-center space-y-3">
            <span className="bg-pink-100 dark:bg-pink-100 text-black dark:text-black text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-pink-200 dark:border-pink-200 inline-block shadow-sm">
              Seguimiento en Tiempo Real
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight !text-black dark:!text-black" style={{ color: '#000000' }}>
              Rastrear Mi Envío
            </h1>
            <p className="text-sm text-black dark:text-black font-bold max-w-lg mx-auto">
              Ingresa el ID de tu Pedido o tu número de teléfono para verificar el estado de preparación y despacho de tu regalo floral.
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-white p-4 md:p-6 rounded-3xl border border-gray-200 dark:border-gray-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-gray-700" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ej: FFY-94812-1 o tu número de teléfono"
                  className="w-full pl-11 pr-4 py-3.5 border rounded-2xl text-sm font-bold text-black dark:text-black bg-white dark:bg-white placeholder:text-gray-600 dark:placeholder:text-gray-600 border-gray-300 dark:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#FF97A4] hover:bg-[#B0004A] text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {loading ? "Buscando..." : "Buscar Pedido"}
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-2xl border border-red-100 dark:border-red-900/50 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Resultado del Rastreo */}
          {order && (() => {
            const isPickup = isPickupOrder(order.deliveryMethod);
            const currentStep = getStatusStep(order.status);

            // Definición de etapas dinámicas según si es Domicilio o Pickup
            const steps = isPickup
              ? [
                  { label: "1. Confirmado", sub: "Pago verificado", icon: Clock },
                  { label: "2. En Diseño", sub: "Armando arreglo", icon: Sparkles },
                  { label: "3. Listo en Boutique", sub: "Listo para retirar", icon: Store },
                  { label: "4. Retirado", sub: "Entregado en tienda", icon: CheckCircle2 }
                ]
              : [
                  { label: "1. Confirmado", sub: "Pago verificado", icon: Clock },
                  { label: "2. En Espera Despacho", sub: "Listo en empaque", icon: Package },
                  { label: "3. En Camino", sub: "Repartidor en ruta", icon: Truck },
                  { label: "4. Entregado", sub: "Entregado en puerta", icon: CheckCircle2 }
                ];

            return (
              <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8 animate-in fade-in duration-500">
                {/* Encabezado del Pedido */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs text-gray-400 font-mono block">ID de Orden: {order.orderId || order._id}</span>
                    <h3 className="text-lg font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
                      <User size={16} className="text-[#FF97A4]" />
                      <span>{order.customerName}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${
                      currentStep === 3
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : currentStep === 2
                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                        : currentStep === 1
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                    }`}>
                      {order.status || (isPickup ? "En Diseño" : "Confirmado")}
                    </span>
                  </div>
                </div>

                {/* Línea de Tiempo / Progreso de 4 Pasos Dinámicos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Progreso de {isPickup ? "Retiro en Boutique 🏪" : "Envío a Domicilio 🚚"}
                    </h4>
                    <span className="text-xs font-bold text-[#FF97A4]">Paso {currentStep + 1} de 4</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {steps.map((st, idx) => {
                      const IconComp = st.icon;
                      const isDone = currentStep >= idx;
                      const isCurrent = currentStep === idx;

                      return (
                        <div key={idx} className="space-y-2">
                          <div className={`w-11 h-11 mx-auto rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrent
                              ? "bg-[#FF97A4] text-white ring-4 ring-[#FF97A4]/20 scale-105 shadow-md"
                              : isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}>
                            <IconComp size={20} />
                          </div>
                          <div>
                            <span className={`text-[11px] font-extrabold block leading-tight ${
                              isDone ? "text-[#1A1C1C] dark:text-white" : "text-gray-500 dark:text-gray-400"
                            }`}>
                              {st.label}
                            </span>
                            <span className="text-[9px] text-gray-600 dark:text-gray-300 font-semibold block hidden sm:block mt-0.5">
                              {st.sub}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detalles de la Orden y Arreglos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-1.5 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider block">
                      {isPickup ? "Lugar de Retiro:" : "Dirección de Entrega:"}
                    </span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-start gap-1.5">
                      {isPickup ? (
                        <Store size={15} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                      ) : (
                        <MapPin size={15} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                      )}
                      <span>{isPickup ? "Boutique Gabriela's Flowers LLC • 4201 Fairmont Pkwy, Pasadena, TX 77504" : (order.address || "Dirección registrada")}</span>
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl space-y-1.5 border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider block">Modalidad & Horario:</span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white flex items-start gap-1.5">
                      <Truck size={15} className="text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{order.deliveryMethod || "Envío Estándar a Domicilio"}</span>
                    </p>
                  </div>
                </div>

                {/* Arreglos Florales Solicitados */}
                {order.items && order.items.length > 0 && (
                  <div className="p-4 bg-gray-50/70 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider block flex items-center gap-1">
                      <Gift size={13} className="text-[#FF97A4]" /> Arreglos e Ítems del Pedido:
                    </span>
                    <div className="space-y-1 text-xs">
                      {order.items.map((it: any, i: number) => (
                        <div key={i} className="flex justify-between items-center font-bold text-gray-900 dark:text-gray-100">
                          <span>• {it.name} (x{it.quantity})</span>
                          <span>${(it.price * it.quantity).toFixed(2)} USD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón Directo a Soporte en WhatsApp */}
                <div className="pt-2 text-center">
                  <a
                    href={`https://wa.me/18323911835?text=${encodeURIComponent(`¡Hola! Quisiera consultar el estado actual de mi pedido ID: ${order.orderId || order._id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-md"
                  >
                    <MessageCircle size={16} />
                    <span>Consultar Estado Actual con un Florista por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      <Footer />
    </div>
  );
}
