"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteProduct, toggleProductStatus } from "@/lib/actions/product";
import { Plus, Search, Edit3, Copy, Trash2, Tag, Package, Image as ImageIcon, Loader2, Pause, Play, Layers } from "lucide-react";

export default function InventarioAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pre_aggregation">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        const resAction = await fetch("/api/products");
        if (resAction.ok) {
          const data = await resAction.json();
          setProducts(data || []);
        }
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  }

  async function handleToggleStatus(id: string, currentIsActive: boolean) {
    const newStatus = !currentIsActive;
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isActive: newStatus } : p))
    );
    await toggleProductStatus(id, newStatus);
  }

  // Obtener lista de categorías únicas para el filtro
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filtrar productos en tiempo real por búsqueda, categoría y estado
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.badge || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive !== false) ||
      (statusFilter === "pre_aggregation" && product.isActive === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const preAggregationCount = products.filter((p) => p.isActive === false).length;
  const activeCount = products.filter((p) => p.isActive !== false).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header del Inventario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C]">Gestión de Catálogo e Inventario</h1>
          <p className="text-xs text-gray-400">Total: {products.length} productos registrados</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/productos/carga-en-masa"
            className="bg-[#1A1C1C] text-white px-5 py-3 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-md flex items-center gap-2"
          >
            <Layers size={18} /> Crear Productos en Masa
          </Link>
          <Link
            href="/admin/productos/crear"
            className="bg-[#FF97A4] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md flex items-center gap-2"
          >
            <Plus size={18} /> Crear Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Barra de Filtros por Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-[#1A1C1C] text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Todos los Productos ({products.length})
        </button>

        <button
          onClick={() => setStatusFilter("active")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "active"
              ? "bg-green-700 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          En Tienda ({activeCount})
        </button>

        <button
          onClick={() => setStatusFilter("pre_aggregation")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === "pre_aggregation"
              ? "bg-[#8B0024] text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          Pre-Agregados / Pausados ⏸️ ({preAggregationCount})
        </button>
      </div>

      {/* Buscador y Filtros en Tiempo Real */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, SKU, categoría o insignia (ej: Bestseller)..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Categoría:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4] w-full md:w-auto"
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

      {/* Tabla / Lista de Productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-[#FF97A4]" size={20} />
            <span>Cargando catálogo...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package size={40} className="mx-auto text-gray-300" />
            <p className="text-gray-500 font-medium">No se encontraron productos coincidentes.</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="text-xs text-[#FF97A4] font-bold hover:underline"
              >
                Limpiar filtros de búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50/50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-4">Producto</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Categoría / Insignia</th>
                  <th className="p-4">Precio</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const firstImage = product.images?.[0];

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                      {/* Producto con Miniatura ImageKit */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {firstImage ? (
                              <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#1A1C1C] block">{product.name}</span>
                            {product.flowerCount ? (
                              <span className="text-[11px] text-gray-400">{product.flowerCount} Rosas / {product.bouquetType || 'Arreglo'}</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="p-4 font-mono text-xs text-gray-500">{product.sku || "S/N"}</td>

                      {/* Categoría e Insignia */}
                      <td className="p-4 space-y-1">
                        <span className="inline-block bg-gray-100 text-gray-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        {product.badge && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#FF97A4]">
                            <Tag size={10} /> {product.badge}
                          </div>
                        )}
                      </td>

                      {/* Precio */}
                      <td className="p-4 font-bold text-[#FF97A4]">${product.price.toFixed(2)}</td>

                      {/* Stock / Estado */}
                      <td className="p-4">
                        {product.isActive === false ? (
                          <span className="px-3 py-1 rounded-full font-bold text-xs inline-block bg-gray-100 text-gray-600 border border-gray-300">
                            Pausado ⏸️
                          </span>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full font-bold text-xs inline-block ${
                              product.stock > 5
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : product.stock > 0
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {product.stock > 0 ? `${product.stock} u.` : "Agotado"}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/editar/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <Link
                            href={`/admin/productos/crear?duplicate=${product._id}`}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Duplicar producto"
                          >
                            <Copy size={16} />
                          </Link>
                          {/* Botón Pausar / Activar */}
                          <button
                            onClick={() => handleToggleStatus(product._id, product.isActive !== false)}
                            className={`p-2 rounded-lg transition-colors ${
                              product.isActive !== false
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-green-600 hover:bg-green-50 font-bold"
                            }`}
                            title={product.isActive !== false ? "Pausar producto (Ocultar de la tienda)" : "Activar producto en la tienda"}
                          >
                            {product.isActive !== false ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
