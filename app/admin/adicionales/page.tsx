"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAddon, toggleAddonStatus } from "@/lib/actions/addon";
import { Plus, Search, Edit3, Trash2, Tag, Sparkles, Image as ImageIcon, Pause, Play, Loader2, Layers } from "lucide-react";

export default function AdicionalesPage() {
  const [addons, setAddons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddons();
  }, []);

  async function fetchAddons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/addons");
      if (res.ok) {
        const data = await res.json();
        setAddons(data.addons || []);
      }
    } catch (error) {
      console.error("Error al cargar adicionales:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`¿Estás seguro de eliminar el adicional "${name}"?`)) {
      await deleteAddon(id);
      setAddons((prev) => prev.filter((a) => a._id !== id));
    }
  }

  async function handleToggleStatus(id: string, currentIsActive: boolean) {
    const newStatus = !currentIsActive;
    setAddons((prev) =>
      prev.map((a) => (a._id === id ? { ...a, isActive: newStatus } : a))
    );
    await toggleAddonStatus(id, newStatus);
  }

  // Lista de categorías únicas
  const categories = ["all", ...Array.from(new Set(addons.map((a) => a.category).filter(Boolean)))];

  // Filtrado en tiempo real
  const filteredAddons = addons.filter((addon) => {
    const matchesSearch =
      (addon.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (addon.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || addon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-[#6xl] max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header de Adicionales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Gestión de Adicionales y Personalizaciones</h1>
          <p className="text-xs text-gray-400">Total: {addons.length} adicionales configurados para los productos</p>
        </div>
        <Link
          href="/admin/adicionales/crear"
          className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Crear Nuevo Adicional
        </Link>
      </div>

      {/* Buscador y Filtro */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o categoría (ej: Ferrero, Peluche, Color)..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 w-full md:w-auto"
            >
              <option value="all">Todas las categorías</option>
              {categories.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid de Adicionales */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border text-center text-gray-400 flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-purple-600" size={20} />
          <span>Cargando adicionales...</span>
        </div>
      ) : filteredAddons.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border text-center space-y-3">
          <Sparkles size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-500 font-medium">No se encontraron adicionales en esta selección.</p>
          <Link
            href="/admin/adicionales/crear"
            className="inline-block bg-purple-600 text-white px-6 py-2.5 rounded-full font-bold text-sm"
          >
            Crear tu primer Adicional
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAddons.map((addon) => (
            <div
              key={addon._id}
              className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md ${
                addon.isActive === false ? "opacity-60 bg-gray-50/80" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Foto o Icono del Adicional */}
                <div className="w-14 h-14 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {addon.image ? (
                    <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles size={22} className="text-purple-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1A1C1C] text-base">{addon.name}</h3>
                    {addon.isActive === false && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Pausado ⏸️
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-purple-600">
                      {addon.price > 0 ? `$${addon.price.toFixed(2)} USD` : "GRATIS"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {addon.category}
                    </span>
                  </div>

                  {addon.options && addon.options.length > 0 && (
                    <p className="text-[11px] text-gray-400 line-clamp-1">
                      Opciones: {addon.options.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/admin/adicionales/editar/${addon._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar adicional"
                >
                  <Edit3 size={16} />
                </Link>

                <button
                  onClick={() => handleToggleStatus(addon._id, addon.isActive !== false)}
                  className={`p-2 rounded-lg transition-colors ${
                    addon.isActive !== false
                      ? "text-amber-600 hover:bg-amber-50"
                      : "text-green-600 hover:bg-green-50 font-bold"
                  }`}
                  title={addon.isActive !== false ? "Pausar adicional (Ocultar de productos)" : "Activar adicional"}
                >
                  {addon.isActive !== false ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <button
                  onClick={() => handleDelete(addon._id, addon.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar adicional"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
