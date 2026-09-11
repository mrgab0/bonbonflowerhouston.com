"use client";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { FeatureListBuilder } from "@/components/admin/FeatureListBuilder";
import { AdminAddonManager } from "@/components/admin/AdminAddonManager";
import { ProductNameSkuInputs } from "@/components/admin/ProductNameSkuInputs";
import { useState, useEffect } from "react";
import { createProduct, getProductById } from "@/lib/actions/product";
import { getAddons } from "@/lib/actions/addon";
import { CheckCircle2, Eye, Edit3, ArrowLeft, Package, DollarSign, Image as ImageIcon, Flower2, PlusCircle, Sparkles, Tag, Copy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CrearProductoPage() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ success: boolean; id?: string } | null>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [initialData, setInitialData] = useState<any>(null);
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  useEffect(() => {
    async function loadData() {
      const addonsRes = await getAddons();
      if (addonsRes.success && addonsRes.data) {
        setAddons(addonsRes.data);
      }

      if (duplicateId) {
        const prodRes = await getProductById(duplicateId);
        if (prodRes.success && prodRes.data) {
          setInitialData(prodRes.data);
        }
      }
    }
    loadData();
  }, [duplicateId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);

    setLoading(false);
    if (result.success) {
      setSuccessData(result);
    } else {
      alert("Hubo un error al guardar el producto.");
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto pb-12">
      {/* Header del Creador */}
      <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/productos" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C]">
              {duplicateId ? "Duplicar Producto" : "Añadir Nuevo Producto"}
            </h1>
            <p className="text-xs text-gray-400">
              {duplicateId
                ? `Creando una copia basada en "${initialData?.name || 'producto'}"`
                : "Completa los detalles de tu nuevo arreglo o producto floral"}
            </p>
          </div>
        </div>

        {duplicateId && (
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <Copy size={12} /> Módulo Duplicador
          </span>
        )}
      </div>

      {/* Formulario */}
      <div className={`transition-all duration-500 ${
        successData ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100"
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: Información Básica */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
              <Package size={18} className="text-[#FF97A4]" /> Información General
            </h2>

            <ProductNameSkuInputs
              key={initialData?._id || duplicateId || "new"}
              initialName={initialData?.name || ""}
              initialSku={initialData?.sku || ""}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Categoría *</label>
                <input
                  name="category"
                  defaultValue={initialData?.category || ""}
                  placeholder="Ej: Bestsellers, Ramos de Rosas, Cajas Deluxe"
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Tag size={12} className="text-[#FF97A4]" /> Insignia / Etiqueta Destacada (Opcional)
                </label>
                <input
                  name="badge"
                  defaultValue={initialData?.badge || ""}
                  placeholder="Ej: Bestseller 🌟, ¡Nuevo!, Edición Limitada"
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Descripción del Producto *</label>
              <textarea
                name="description"
                defaultValue={initialData?.description || ""}
                placeholder="Escribe una descripción detallada sobre las flores, el diseño y la presentación..."
                className="p-3 border rounded-xl h-28 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>
          </div>

          {/* SECCIÓN 2: Precio e Inventario */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
              <DollarSign size={18} className="text-[#FF97A4]" /> Precio y Disponibilidad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Precio ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 font-bold">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="85.00"
                    defaultValue={initialData?.price || ""}
                    className="p-3 pl-8 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-bold text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Stock Inicial *</label>
                <input
                  name="stock"
                  type="number"
                  placeholder="10"
                  defaultValue={initialData?.stock || "10"}
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Carga de Imágenes con ImageKit */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
              <ImageIcon size={18} className="text-[#FF97A4]" /> Galería de Imágenes (ImageKit)
            </h2>
            <ImageUploader defaultImages={initialData?.images || []} maxImages={7} />
          </div>

          {/* SECCIÓN 4: Especificaciones Florales */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
              <Flower2 size={18} className="text-[#FF97A4]" /> Especificaciones del Arreglo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Cantidad de Rosas / Flores</label>
                <input
                  name="flowerCount"
                  type="number"
                  defaultValue={initialData?.flowerCount || ""}
                  placeholder="Ej: 12, 24, 50"
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Tipo de Presentación / Bouquet</label>
                <select
                  name="bouquetType"
                  defaultValue={initialData?.bouquetType || "ramo"}
                  className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium"
                >
                  <option value="ramo">Ramo de Mano</option>
                  <option value="box">Box / Caja Deluxe</option>
                  <option value="florero">Arreglo en Florero de Vidrio</option>
                  <option value="premium">Edición Especial Premium</option>
                </select>
              </div>
            </div>

            {/* Constructor de Viñetas / Puntos Clave */}
            <FeatureListBuilder initialFeatures={initialData?.features || []} />
          </div>

          {/* SECCIÓN 5: Adicionales Compatibles */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <AdminAddonManager
              addons={addons}
              selectedIds={initialData?.addons || []}
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FF97A4] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-all shadow-md disabled:bg-gray-400 flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              {loading ? (
                <span>Guardando Producto...</span>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Publicar Producto</span>
                </>
              )}
            </button>
            <Link
              href="/admin/productos"
              className="bg-gray-100 text-gray-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Pantalla de Éxito Animada */}
      {successData && (
        <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center space-y-4 my-8">
          <div className="bg-green-100 p-4 rounded-full text-green-600 animate-bounce">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">¡Producto Creado Exitosamente!</h2>
          <p className="text-gray-500 max-w-sm">El producto ya está disponible en el catálogo de tu tienda boutique.</p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-[#1A1C1C] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
            >
              <Eye size={18} /> Ver Publicación
            </Link>
            <Link
              href={`/admin/productos/editar/${successData.id}`}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
            >
              <Edit3 size={18} /> Editar Producto
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              <ArrowLeft size={18} /> Crear Otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
