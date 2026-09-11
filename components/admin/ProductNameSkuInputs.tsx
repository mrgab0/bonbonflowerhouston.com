"use client";

import { useState, useEffect } from "react";
import { generateSkuFromName } from "@/lib/utils/skuGenerator";
import { Sparkles, RefreshCw, Check } from "lucide-react";

interface ProductNameSkuInputsProps {
  initialName?: string;
  initialSku?: string;
  isEditMode?: boolean;
}

export function ProductNameSkuInputs({
  initialName = "",
  initialSku = "",
  isEditMode = false
}: ProductNameSkuInputsProps) {
  const [name, setName] = useState(initialName);
  const [sku, setSku] = useState(initialSku);
  // Si estamos en modo creación y no hay SKU inicial, se considera auto-mapeado por defecto.
  // Si hay SKU previo en edición, se marca como personalizado a menos que el usuario presione auto-generar.
  const [isManuallyEdited, setIsManuallyEdited] = useState(isEditMode && Boolean(initialSku));
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sincronizar si cambian los valores iniciales (ej. cuando carga duplicado o edición)
  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
    if (initialSku && !sku) {
      setSku(initialSku);
      setIsManuallyEdited(true);
    }
  }, [initialName, initialSku]);

  // Manejador del cambio en el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (!isManuallyEdited) {
      const generated = generateSkuFromName(newName);
      setSku(generated);
    }
  };

  // Manejador del cambio manual en el SKU
  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = e.target.value;
    setSku(newSku);
    setIsManuallyEdited(true);
  };

  // Forzar la auto-generación del SKU desde el nombre actual
  const handleRegenerateSku = () => {
    const generated = generateSkuFromName(name);
    setSku(generated);
    setIsManuallyEdited(false);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Campo: Nombre del Producto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          Nombre del Producto *
        </label>
        <input
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Ej: Box Roses Purple and White"
          className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium dark:bg-gray-900 dark:text-white"
          required
        />
      </div>

      {/* Campo: SKU + Botón de Auto-generación */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            SKU (Código único) *
          </label>

          <button
            type="button"
            onClick={handleRegenerateSku}
            title="Auto-generar SKU desde el nombre del producto"
            className="text-[11px] text-pink-600 dark:text-pink-400 font-bold hover:underline flex items-center gap-1 bg-pink-50 dark:bg-pink-950/50 px-2 py-0.5 rounded-md border border-pink-200 dark:border-pink-900/60 active:scale-95 transition-all"
          >
            {copiedNotification ? (
              <>
                <Check size={12} className="text-green-600" />
                <span className="text-green-600">¡SKU Generado!</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>⚡ Auto-generar SKU</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <input
            name="sku"
            value={sku}
            onChange={handleSkuChange}
            placeholder="Ej: bx-rs-prlp-wt"
            className={`p-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-mono text-sm dark:bg-gray-900 dark:text-white ${
              !isManuallyEdited && sku ? "border-pink-300 bg-pink-50/20" : ""
            }`}
            required
          />
        </div>

        {/* Indicativo del estado del SKU */}
        <div className="text-[10px] text-gray-400 font-medium px-1 flex items-center justify-between">
          {!isManuallyEdited && sku ? (
            <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1">
              ✨ Mapeado automáticamente desde el nombre
            </span>
          ) : isManuallyEdited ? (
            <span className="text-gray-500 flex items-center gap-1">
              ✏️ SKU personalizado manualmente
            </span>
          ) : (
            <span>Formato: bx-rs-prlp-wt</span>
          )}
        </div>
      </div>
    </div>
  );
}
