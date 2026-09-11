"use client";

import { useEffect, useState } from "react";
import { getCouponsAdmin, createCoupon, toggleCouponStatus, deleteCoupon } from "@/lib/actions/coupon";
import { Ticket, Plus, Tag, Trash2, Pause, Play, CheckCircle2, Gift, Sparkles, Percent, DollarSign, Users, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    const { data } = await getCouponsAdmin();
    if (data) setCoupons(data);
    setLoading(false);
  }

  async function handleCreateCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await createCoupon(formData);
    setSubmitting(false);

    if (result.success) {
      form.reset();
      loadCoupons();
    } else {
      setErrorMessage(result.error || "Error al crear el cupón.");
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    setCoupons((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isActive: !currentStatus } : c))
    );
    await toggleCouponStatus(id, !currentStatus);
  }

  async function handleDelete(id: string, code: string) {
    if (confirm(`¿Estás seguro de eliminar el cupón "${code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      await deleteCoupon(id);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Estilizado Estándar Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C]">Creador y Gestión de Cupones</h1>
            <p className="text-xs text-gray-400">Configura cupones por código o cupones de inauguración automáticos por orden de llegada</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* FORMULARIO DE CREACIÓN */}
        <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
            <Sparkles size={18} className="text-purple-600" /> Crear Nuevo Cupón
          </h2>

          {errorMessage && (
            <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 font-bold flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Código del Cupón *</label>
              <input
                name="code"
                placeholder="Ej: BIENVENIDA10, INAUGURACION, PRIMEROS10"
                className="p-3.5 border rounded-xl uppercase font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono tracking-wider"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Tipo de Descuento *</label>
                <select
                  name="discountType"
                  className="p-3.5 border rounded-xl bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="percentage">% Porcentaje</option>
                  <option value="fixed">$ Monto Fijo ($ USD)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Valor de Descuento *</label>
                <input
                  name="discountValue"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 10 o 15"
                  className="p-3.5 border rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Usos Máximos *</label>
                <input
                  name="maxUses"
                  type="number"
                  defaultValue="10"
                  placeholder="Ej: 10"
                  className="p-3.5 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Compra Mínima ($)</label>
                <input
                  name="minPurchase"
                  type="number"
                  step="0.01"
                  defaultValue="0"
                  placeholder="0.00"
                  className="p-3.5 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 flex items-start gap-3">
              <input
                type="checkbox"
                id="isAutoLaunch"
                name="isAutoLaunch"
                value="true"
                className="w-4 h-4 accent-purple-600 rounded mt-0.5"
              />
              <label htmlFor="isAutoLaunch" className="text-xs text-purple-900 cursor-pointer font-bold leading-relaxed">
                🎁 Aplicar Automáticamente a los Primeros Clientes (Inauguración)
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-600 text-white py-4 rounded-full font-bold hover:bg-purple-700 transition-all text-sm shadow-md disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Guardando Cupón...</span>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Crear Cupón de Descuento</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* LISTA DE CUPONES EXISTENTES */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-3 flex items-center justify-between">
            <span>Cupones Registrados ({coupons.length})</span>
          </h2>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl border text-center text-gray-400">
              Cargando cupones...
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border text-center text-gray-400 space-y-3">
              <Ticket size={36} className="mx-auto text-gray-300" />
              <p className="font-medium text-sm">No tienes cupones creados aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
                    coupon.isActive === false ? "opacity-60 bg-gray-50" : ""
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base text-[#1A1C1C] bg-gray-100 px-3 py-1 rounded-xl border">
                        {coupon.code}
                      </span>
                      {coupon.isAutoLaunch && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles size={12} /> Auto Inauguración
                        </span>
                      )}
                      {coupon.isActive === false && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Pausado ⏸️
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                      <span className="font-extrabold text-purple-600">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `-$${coupon.discountValue.toFixed(2)} USD`}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-gray-700">
                        <Users size={12} /> Usos: {coupon.usedCount} / {coupon.maxUses}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(coupon._id, coupon.isActive !== false)}
                      className={`p-2 rounded-xl transition-colors ${
                        coupon.isActive !== false
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={coupon.isActive !== false ? "Pausar cupón" : "Activar cupón"}
                    >
                      {coupon.isActive !== false ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <button
                      onClick={() => handleDelete(coupon._id, coupon.code)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar cupón"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
