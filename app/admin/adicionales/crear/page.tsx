"use client";

import { useState } from "react";
import { createAddon } from "@/lib/actions/addon";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { ArrowLeft, Sparkles, DollarSign, Tag, Layers, CheckCircle2, PlusCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CrearAdicionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [type, setType] = useState("checkbox");
  const [optionsInput, setOptionsInput] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image", imageUrl);

    const result = await createAddon(formData);

    setLoading(false);
    if (result.success) {
      router.push("/admin/adicionales");
    } else {
      alert("Hubo un error al guardar el adicional.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <Link href="/admin/adicionales" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Crear Nuevo Adicional</h1>
          <p className="text-xs text-gray-400">Agrega bombones, peluches, notas personalizadas o mariposas</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN 1: Información Básica */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
            <Sparkles size={18} className="text-purple-600" /> Datos Generales del Adicional
          </h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Nombre del Adicional *</label>
            <input
              name="name"
              placeholder="Ej: Ferrero Rocher 16ct, Mariposa Decorativa, Color de Rosas"
              className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Categoría Interna *</label>
              <select
                name="category"
                className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
              >
                <option value="Chocolates & Dulces">Chocolates & Dulces</option>
                <option value="Peluches & Globos">Peluches & Globos</option>
                <option value="Personalización & Tarjetas">Personalización & Tarjetas</option>
                <option value="Decoración & Lazos">Decoración (Mariposas/Lazos)</option>
                <option value="Colores & Papeles">Colores de Flores / Empaque</option>
                <option value="Otros">Otros Complementos</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Precio Adicional ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400 font-bold">$</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue="0.00"
                  className="p-3 pl-8 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 font-bold text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Tipo de Comportamiento / Input *</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
            >
              <option value="checkbox">Selección Simple (Checkbox / Agregar producto)</option>
              <option value="select">Opciones Múltiples (Color de rosas, tipo de papel, etc.)</option>
              <option value="text">Mensaje de Texto Personalizado (Mensaje de Tarjeta / Dedicatoria)</option>
            </select>
          </div>

          {/* Opciones separadas por comas (Solo si es 'select') */}
          {type === "select" && (
            <div className="flex flex-col gap-1.5 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
              <label className="text-xs font-bold text-purple-900 flex items-center gap-1">
                <Layers size={14} /> Opciones Disponibles (Separadas por comas) *
              </label>
              <input
                name="options"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="Ej: Rojas, Rosadas, Blancas, Amarillas, Mixto"
                className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                required
              />
              <span className="text-[11px] text-purple-700">
                Escribe cada opción separada por comas para que los clientes puedan elegir la de su preferencia en la tienda.
              </span>
            </div>
          )}
        </div>

        {/* SECCIÓN 2: Foto del Adicional (ImageKit) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3">
            <Sparkles size={18} className="text-purple-600" /> Imagen del Adicional (ImageKit)
          </h2>
          <SingleImageUploader
            currentImage={imageUrl}
            onImageUploaded={(url) => setImageUrl(url)}
            label="Foto del Bombón, Peluche o Adicional"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-purple-700 transition-all shadow-md disabled:bg-gray-400 flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            {loading ? (
              <span>Guardando Adicional...</span>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Guardar Adicional</span>
              </>
            )}
          </button>
          <Link
            href="/admin/adicionales"
            className="bg-gray-100 text-gray-700 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
