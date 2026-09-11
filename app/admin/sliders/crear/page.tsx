"use client";

import { useState } from "react";
import { createSlider } from "@/lib/actions/slider";
import { useRouter } from "next/navigation";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { Monitor, Smartphone, ArrowLeft, Layers, EyeOff, Eye } from "lucide-react";
import Link from "next/link";

export default function CrearSliderPage() {
  const [type, setType] = useState<'banner' | 'spotlight'>('banner');
  const [showOverlay, setShowOverlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.type = type;
    data.showOverlay = showOverlay;
    data.order = parseInt(data.order) || 0;

    const result = await createSlider(data);
    setLoading(false);

    if (result.success) {
      router.push("/admin/sliders");
    } else {
      alert("Error al crear la promoción");
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header del Creador */}
      <div className="flex items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/sliders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C]">Crear Nueva Promoción / Slider</h1>
            <p className="text-xs text-gray-400">Configura banners responsivos con ImageKit para escritorio y móviles</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Tipo de Promoción
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium"
          >
            <option value="banner">Banner Promocional (Imagen para Escritorio + Móvil)</option>
            <option value="spotlight">Spotlight de Productos (Cards de Oferta + Contador)</option>
          </select>
        </div>

        {type === 'banner' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título del Banner</label>
                <input
                  name="title"
                  placeholder="Ej: Colección Especial Primavera 🌸"
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enlace de Destino (URL)</label>
                <input
                  name="link"
                  placeholder="/productos/ramo-magenta o https://..."
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción Breve</label>
              <textarea
                name="description"
                placeholder="Descripción corta o subtítulo de la oferta..."
                className="p-3 border rounded-xl h-20 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
              />
            </div>

            {/* SECCIÓN DE SUBIDA DE IMÁGENES IMAGEKIT: ESCRITORIO Y MÓVIL */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-sm text-[#1A1C1C] flex items-center gap-2 border-b pb-2">
                <Layers size={18} className="text-[#FF97A4]" /> Banners Responsivos (ImageKit)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Banner Escritorio */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
                    <Monitor size={16} className="text-blue-500" />
                    <span>Banner para Escritorio</span>
                  </div>
                  <SingleImageUploader
                    name="image"
                    label="Imagen Escritorio"
                    recommendation="Recomendado: 1920x500px o panorámico"
                    required
                  />
                </div>

                {/* Banner Móvil */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1">
                    <Smartphone size={16} className="text-green-500" />
                    <span>Banner para Móvil (Android/iOS)</span>
                  </div>
                  <SingleImageUploader
                    name="mobileImage"
                    label="Imagen Móvil"
                    recommendation="Recomendado: 800x800px o 600x800px"
                  />
                </div>
              </div>
            </div>

            {/* PERSONALIZACIÓN DE BOTÓN Y SUPERPOSICIÓN */}
            <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Personalización del Botón y Texto (CTA)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Texto del Botón (CTA)</label>
                  <input
                    name="ctaText"
                    defaultValue="Ver Oferta"
                    placeholder="Ej: Comprar Ahora, Ver Colección, Hablar por WhatsApp"
                    className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Orden de Prioridad</label>
                  <input
                    name="order"
                    type="number"
                    defaultValue="0"
                    placeholder="0"
                    className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showOverlay}
                  onChange={(e) => setShowOverlay(e.target.checked)}
                  className="w-5 h-5 accent-[#FF97A4] rounded"
                />
                <div className="flex-1">
                  <span className="font-bold text-sm text-[#1A1C1C] flex items-center gap-1.5">
                    {showOverlay ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-amber-500" />}
                    Mostrar superposición de texto y botón sobre el banner
                  </span>
                  <p className="text-xs text-gray-400">
                    Desactívalo si tu diseño gráfico ya incluye el texto integrado en la imagen.
                  </p>
                </div>
              </label>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <input name="title" placeholder="Título del Spotlight" className="p-3 border rounded-xl w-full" required />
            <input name="discountPercentage" type="number" placeholder="% Descuento (ej: 20)" className="p-3 border rounded-xl w-full" required />
            <input name="discountExpiry" type="datetime-local" className="p-3 border rounded-xl w-full" required />
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF97A4] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md disabled:bg-gray-400 w-full md:w-auto"
          >
            {loading ? "Guardando..." : "Guardar Promoción"}
          </button>
          <Link
            href="/admin/sliders"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

