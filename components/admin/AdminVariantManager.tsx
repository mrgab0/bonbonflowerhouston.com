"use client";

import { useState, useEffect } from "react";
import { GitMerge, CheckSquare, Square } from "lucide-react";

interface AdminVariantManagerProps {
  variants: any[]; // Recibe un array de productos
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
}

export function AdminVariantManager({ variants, selectedIds = [], onChange }: AdminVariantManagerProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (selectedIds) {
      setSelected(selectedIds);
    }
  }, [JSON.stringify(selectedIds)]);

  const toggleVariant = (id: string) => {
    let updated: string[];
    if (selected.includes(id)) {
      updated = selected.filter((item) => item !== id);
    } else {
      updated = [...selected, id];
    }
    setSelected(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-800">
        <GitMerge size={16} className="text-[#FF97A4]" />
        <span>Variantes del Producto (Opcional)</span>
      </div>
      <p className="text-[10px] text-gray-500 mb-2">
        Selecciona otros productos que sean versiones de este mismo arreglo (ej. con más rosas o en diferente color).
      </p>

      {/* Renderizar inputs ocultos name="variants" para cada variante seleccionada en el formulario */}
      {selected.map((variantId) => (
        <input key={`variant-${variantId}`} type="hidden" name="variants" value={variantId} />
      ))}

      {variants.length === 0 ? (
        <p className="text-xs text-gray-400 p-2">No hay otros productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
          {variants.map((product) => {
            const variantIdStr = product._id ? product._id.toString() : "";
            const isSelected = selected.includes(variantIdStr);
            return (
              <div
                key={variantIdStr || product.name}
                onClick={() => toggleVariant(variantIdStr)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? "bg-pink-50 dark:bg-pink-950/40 border-[#FF97A4] text-[#1A1C1C] dark:text-white shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-300"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {isSelected ? (
                    <CheckSquare size={16} className="text-[#FF97A4] flex-shrink-0" />
                  ) : (
                    <Square size={16} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />
                  )}
                  <span className="font-bold truncate">{product.name}</span>
                </div>
                <span className="font-extrabold text-gray-800 dark:text-gray-200 ml-2 flex-shrink-0">${product.price}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
