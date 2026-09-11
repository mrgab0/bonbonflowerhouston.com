"use client";

import { useState, useEffect } from "react";
import { getSliderById, updateSlider } from "@/lib/actions/slider";
import { useRouter, useParams } from "next/navigation";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { Monitor, Smartphone, ArrowLeft, Layers, EyeOff, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditarSliderPage() {
  const [slider, setSlider] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function loadSlider() {
      const { data } = await getSliderById(id as string);
      if (data) {
        setSlider(data);
        setShowOverlay(data.showOverlay !== false);
      }
    }
    loadSlider();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.showOverlay = showOverlay;
    data.order = parseInt(data.order) || 0;

    const result = await updateSlider(id as string, data);
    setLoading(false);

    if (result.success) {
      router.push("/admin/sliders");
    } else {
      alert("Error al actualizar la promoción");
    }
  };

  if (!slider) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 gap-2">
        <Loader2 className="animate-spin text-[#FF97A4]" size={24} />
        <span>Cargando promoción...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b">
        <Link href="/admin/sliders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Editar Promoción / Slider</h1>
          <p className="text-xs text-gray-400">Modifica los banners e imágenes para escritorio y teléfonos</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {slider.type === 'banner' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título del Banner</label>
                <input
                  name="title"
                  defaultValue={slider.title || ""}
                  placeholder="Ej: Colección Especial Primavera 🌸"
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enlace de Destino (URL)</label>
                <input
                  name="link"
                  defaultValue={slider.link || ""}
                  placeholder="/productos/ramo-magenta o https://..."
                  className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción Breve</label>
              <textarea
                name="description"
                defaultValue={slider.description || ""}
                placeholder="Descripción corta o subtítulo..."
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
                    defaultValue={slider.image || ""}
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
                    defaultValue={slider.mobileImage || ""}
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
                    defaultValue={slider.ctaText || "Ver Oferta"}
                    placeholder="Ej: Comprar Ahora, Ver Colección, Hablar por WhatsApp"
                    className="p-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600">Orden de Prioridad</label>
                  <input
                    name="order"
                    type="number"
                    defaultValue={slider.order || 0}
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
            <input name="title" defaultValue={slider.title} className="p-3 border rounded-xl w-full" required />
            <input name="discountPercentage" type="number" defaultValue={slider.discountPercentage} className="p-3 border rounded-xl w-full" required />
            <input name="discountExpiry" type="datetime-local" defaultValue={slider.discountExpiry ? new Date(slider.discountExpiry).toISOString().slice(0, 16) : ''} className="p-3 border rounded-xl w-full" required />
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#FF97A4] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md disabled:bg-gray-400 w-full md:w-auto"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
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

