"use client";

import { getSliders, deleteSlider } from "@/lib/actions/slider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Monitor, Smartphone, Eye, EyeOff, Tag } from "lucide-react";

export default function SlidersPage() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSliders();
  }, []);

  async function loadSliders() {
    setLoading(true);
    const { data } = await getSliders();
    if (data) {
      const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSliders(sorted);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Estás seguro de eliminar esta promoción?")) {
      await deleteSlider(id);
      loadSliders();
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Promociones y Banners Slider</h1>
          <p className="text-xs text-gray-400">Gestiona las imágenes responsivas para la portada de tu tienda</p>
        </div>
        <Link
          href="/admin/sliders/crear"
          className="bg-[#FF97A4] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Crear Nueva Promoción
        </Link>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-gray-400">
          Cargando promociones...
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center space-y-4">
          <p className="text-gray-500 font-medium">No hay promociones o sliders creados aún.</p>
          <Link
            href="/admin/sliders/crear"
            className="inline-block bg-[#FF97A4] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors"
          >
            Crear tu primer Banner
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sliders.map((slider) => (
            <div
              key={slider._id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                {/* Miniaturas de Imágenes (Escritorio + Móvil) */}
                <div className="flex gap-2">
                  <div className="relative w-24 h-14 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0" title="Banner Escritorio">
                    {slider.image ? (
                      <img src={slider.image} alt="Escritorio" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Sin img</div>
                    )}
                    <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded flex items-center gap-0.5">
                      <Monitor size={8} /> PC
                    </span>
                  </div>

                  {slider.mobileImage && (
                    <div className="relative w-14 h-14 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0" title="Banner Móvil">
                      <img src={slider.mobileImage} alt="Móvil" className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 left-0.5 bg-black/60 text-white text-[9px] px-1 rounded flex items-center gap-0.5">
                        <Smartphone size={8} /> Móvil
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1A1C1C] text-base">{slider.title || "Sin título"}</h3>
                    <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                      Orden: #{slider.order || 0}
                    </span>
                  </div>

                  {slider.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{slider.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                    {slider.ctaText && (
                      <span className="flex items-center gap-1 text-[#FF97A4] font-bold">
                        <Tag size={12} /> Botón: "{slider.ctaText}"
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {slider.showOverlay !== false ? (
                        <span className="text-green-600 flex items-center gap-1"><Eye size={12} /> Con Superposición</span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1"><EyeOff size={12} /> Imagen Limpia</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Link
                  href={`/admin/sliders/editar/${slider._id}`}
                  className="flex items-center gap-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <Edit3 size={14} /> Editar
                </Link>
                <button
                  onClick={() => handleDelete(slider._id)}
                  className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

