import dbConnect from "@/lib/db";
import { Product, IProduct } from "@/lib/models/Product";
import { Addon } from "@/lib/models/Addon";
import { updateProductFormAction } from "@/lib/actions/product";
import Link from "next/link";
import { ArrowLeft, Package, Tag, DollarSign, Image as ImageIcon, Flower2, Save } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { FeatureListBuilder } from "@/components/admin/FeatureListBuilder";
import { AdminAddonManager } from "@/components/admin/AdminAddonManager";
import { ProductNameSkuInputs } from "@/components/admin/ProductNameSkuInputs";
import mongoose from "mongoose";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;

  // Validación de ObjectId seguro para evitar CastError 500 en Vercel
  if (!resolvedParams.id || !mongoose.Types.ObjectId.isValid(resolvedParams.id)) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-[#12131A] rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-4 my-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">ID de Producto Inválido</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">El identificador proporcionado no es un código válido.</p>
        <Link href="/admin/productos" className="inline-block bg-[#FF97A4] text-white px-6 py-2.5 rounded-full font-bold text-sm">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const product = (await Product.findById(resolvedParams.id).populate('addons').lean()) as IProduct | null;
  const allAddons = await Addon.find({ isActive: true }).lean();

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-white dark:bg-[#12131A] rounded-2xl border border-gray-100 dark:border-gray-800 text-center space-y-4 my-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Producto No Encontrado</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">El producto solicitado no existe o fue eliminado.</p>
        <Link href="/admin/productos" className="inline-block bg-[#FF97A4] text-white px-6 py-2.5 rounded-full font-bold text-sm">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const selectedAddonIds = product.addons ? product.addons.map((a: any) => a._id ? a._id.toString() : a.toString()) : [];

  // Sanitización pura de características para evitar transmisión de Mongoose ObjectIds a Client Components
  const plainFeatures = product.features 
    ? JSON.parse(JSON.stringify(product.features)).map((f: any) => ({
        label: String(f.label || ""),
        value: String(f.value || "")
      }))
    : [];

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header de Edición */}
      <div className="flex items-center gap-4 mb-6 bg-white dark:bg-[#12131A] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white">Editar Producto</h1>
          <p className="text-xs text-gray-400">Modifica la información, precio o imágenes de "{product.name}"</p>
        </div>
      </div>

      <form action={updateProductFormAction} className="space-y-6">
        <input type="hidden" name="id" value={product._id.toString()} />

        {/* SECCIÓN 1: Información Básica */}
        <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
            <Package size={18} className="text-[#FF97A4]" /> Información General
          </h2>

          <ProductNameSkuInputs
            initialName={product.name}
            initialSku={product.sku || ""}
            isEditMode={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Categoría *</label>
              <input
                name="category"
                defaultValue={product.category}
                placeholder="Bestseller"
                className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Tag size={12} className="text-[#FF97A4]" /> Insignia / Etiqueta Destacada (Opcional)
              </label>
              <input
                name="badge"
                defaultValue={product.badge || ""}
                placeholder="Ej: Bestseller 🌟, ¡Nuevo!, Edición Limitada"
                className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Descripción del Producto *</label>
            <textarea
              name="description"
              defaultValue={product.description}
              placeholder="Detalles sobre el diseño floral..."
              className="p-3 border rounded-xl h-28 focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
              required
            />
          </div>
        </div>

        {/* SECCIÓN 2: Precio e Inventario */}
        <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
            <DollarSign size={18} className="text-[#FF97A4]" /> Precio y Disponibilidad
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Precio ($ USD) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400 font-bold">$</span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={product.price}
                  placeholder="85.00"
                  className="p-3 pl-8 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-bold text-gray-800 dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Stock Actual *</label>
              <input
                name="stock"
                type="number"
                defaultValue={product.stock || 0}
                placeholder="10"
                className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Galería de Imágenes ImageKit */}
        <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
            <ImageIcon size={18} className="text-[#FF97A4]" /> Galería de Imágenes (ImageKit)
          </h2>
          <ImageUploader defaultImages={product.images || []} maxImages={7} />
        </div>

        {/* SECCIÓN 4: Especificaciones Florales */}
        <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
            <Flower2 size={18} className="text-[#FF97A4]" /> Especificaciones del Arreglo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Cantidad de Rosas / Flores</label>
              <input
                name="flowerCount"
                type="number"
                defaultValue={product.flowerCount || ""}
                placeholder="Ej: 12, 24, 50"
                className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tipo de Presentación / Bouquet</label>
              <select
                name="bouquetType"
                defaultValue={product.bouquetType || "ramo"}
                className="p-3 border rounded-xl bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium"
              >
                <option value="ramo">Ramo de Mano</option>
                <option value="box">Box / Caja Deluxe</option>
                <option value="florero">Arreglo en Florero de Vidrio</option>
                <option value="premium">Edición Especial Premium</option>
              </select>
            </div>
          </div>

          {/* Constructor de Viñetas / Puntos Clave Sanitizados */}
          <FeatureListBuilder initialFeatures={plainFeatures} />
        </div>

        {/* Admin Addon Manager sin event handlers en props de RSC */}
        <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <AdminAddonManager addons={JSON.parse(JSON.stringify(allAddons))} selectedIds={selectedAddonIds} />
        </div>
        
        {/* Botones de Acción */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="bg-[#FF97A4] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-all shadow-md flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <Save size={18} />
            <span>Guardar Cambios</span>
          </button>
          <Link
            href="/admin/productos"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
