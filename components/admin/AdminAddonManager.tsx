"use client";

import { useState, useEffect } from "react";
import { IAddon } from "@/lib/models/Addon";
import { Layers, CheckSquare, Square } from "lucide-react";

interface AdminAddonManagerProps {
  addons: IAddon[];
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
}

export function AdminAddonManager({ addons, selectedIds = [], onChange }: AdminAddonManagerProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (selectedIds) {
      setSelected(selectedIds);
    }
  }, [JSON.stringify(selectedIds)]);

  const toggleAddon = (id: string) => {
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
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
        <Layers size={16} className="text-[#FF97A4]" />
        <span>Adicionales / Complementos disponibles</span>
      </div>

      {/* Renderizar inputs ocultos name="addons" para cada adicional seleccionado en el formulario */}
      {selected.map((addonId) => (
        <input key={addonId} type="hidden" name="addons" value={addonId} />
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
        {addons.map((addon) => {
          const addonIdStr = addon._id ? addon._id.toString() : "";
          const isSelected = selected.includes(addonIdStr);
          return (
            <div
              key={addonIdStr || addon.name}
              onClick={() => toggleAddon(addonIdStr)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                isSelected
                  ? "bg-pink-50 dark:bg-pink-950/40 border-[#FF97A4] text-[#1A1C1C] dark:text-white"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-300"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {isSelected ? (
                  <CheckSquare size={16} className="text-[#FF97A4] flex-shrink-0" />
                ) : (
                  <Square size={16} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />
                )}
                <span className="font-bold truncate">{addon.name}</span>
              </div>
              <span className="font-extrabold text-[#FF97A4] ml-2 flex-shrink-0">+${addon.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
