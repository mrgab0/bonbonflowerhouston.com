"use client";

import { useState } from "react";
import { Palette, Layers, Plus, Trash2, Sparkles, Check } from "lucide-react";

interface StemTier {
  label: string;
  stems: number;
  price: number;
}

interface ProductFloralConfiguratorProps {
  initialColors?: string[];
  initialStemTiers?: StemTier[];
  initialPricePerExtraRose?: number;
}

const PRESET_COLORS = [
  { name: "Red", bg: "#b91c1c", text: "#ffffff" },
  { name: "Deep Purple", bg: "#4a154b", text: "#ffffff" },
  { name: "Light Pink", bg: "#fbcfe8", text: "#831843" },
  { name: "White", bg: "#ffffff", border: "#cbd5e1", text: "#0f172a" },
  { name: "Sweet Beat", bg: "#be185d", text: "#ffffff" },
  { name: "Hot Pink", bg: "#ec4899", text: "#ffffff" },
  { name: "Rojo Pasión", bg: "#991b1b", text: "#ffffff" },
  { name: "Rosa Empolvado", bg: "#fbcfe8", text: "#831843" },
  { name: "Blanco Puro", bg: "#ffffff", border: "#cbd5e1", text: "#0f172a" },
  { name: "Amarillo Dorado", bg: "#fef08a", text: "#713f12" },
  { name: "Negro Couture", bg: "#18181b", text: "#ffffff" },
  { name: "Bicolor Romance", bg: "linear-gradient(135deg, #be123c 50%, #fbcfe8 50%)", text: "#ffffff" },
  { name: "Azul Real", bg: "#1d4ed8", text: "#ffffff" },
  { name: "Lavanda / Lila", bg: "#e9d5ff", text: "#581c87" },
];

export function ProductFloralConfigurator({
  initialColors = [],
  initialStemTiers = [],
}: ProductFloralConfiguratorProps) {
  const [colors, setColors] = useState<string[]>(initialColors);
  const [customColor, setCustomColor] = useState("");
  const [stemTiers, setStemTiers] = useState<StemTier[]>(initialStemTiers);

  // Estados para nuevo tier
  const [newTierLabel, setNewTierLabel] = useState("");
  const [newTierStems, setNewTierStems] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter((c) => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const addCustomColor = () => {
    const trimmed = customColor.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
      setCustomColor("");
    }
  };

  const addStemTier = () => {
    const stems = parseInt(newTierStems) || 0;
    const price = parseFloat(newTierPrice) || 0;
    const label = newTierLabel.trim() || `${stems} Rosas`;

    if (stems > 0 && price >= 0) {
      setStemTiers([...stemTiers, { label, stems, price }]);
      setNewTierLabel("");
      setNewTierStems("");
      setNewTierPrice("");
    }
  };

  const removeStemTier = (index: number) => {
    setStemTiers(stemTiers.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-[#12131A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
      <div className="border-b pb-3 border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF97A4]" /> Configurador Floral (Colores & Volúmenes Stitch)
        </h2>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] border border-pink-200 dark:border-pink-900/50">
          Atelier Interactivo
        </span>
      </div>

      {/* Inputs ocultos para FormData */}
      <input type="hidden" name="availableColors" value={colors.join(",")} />
      <input type="hidden" name="stemTiers" value={JSON.stringify(stemTiers)} />

      {/* 1. SELECCIÓN DE COLORES DISPONIBLES */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Palette size={14} className="text-pink-500" /> Colores Disponibles para este Ramo
        </label>
        <p className="text-[11px] text-gray-400">
          Haz clic para activar o desactivar los colores que el cliente podrá elegir en la página de producto:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {PRESET_COLORS.map((preset) => {
            const isSelected = colors.includes(preset.name);
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => toggleColor(preset.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#163422] text-white border-[#163422] shadow-sm ring-2 ring-[#FF97A4]/40"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-gray-400"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 inline-block shadow-xs"
                  style={{
                    background: preset.bg,
                    borderColor: preset.border || "transparent",
                  }}
                />
                <span>{preset.name}</span>
                {isSelected && <Check size={12} className="text-[#5EEAD4]" />}
              </button>
            );
          })}
        </div>

        {/* Añadir Color Personalizado */}
        <div className="flex gap-2 pt-1 max-w-md">
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomColor();
              }
            }}
            placeholder="Añadir otro color (ej. Coral Velvet)..."
            className="p-2.5 border rounded-xl text-xs flex-1 dark:bg-gray-900 dark:text-white dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
          />
          <button
            type="button"
            onClick={addCustomColor}
            className="px-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Añadir
          </button>
        </div>
      </div>

      {/* 2. TIERS DE VOLUMEN / CANTIDAD DE ROSAS */}
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Layers size={14} className="text-pink-500" /> Tiers de Volumen Floral (Ej: 25, 50, 75, 100 Rosas)
        </label>
        <p className="text-[11px] text-gray-400">
          Permite al cliente cambiar el tamaño del ramo entre diferentes cantidades de rosas con su precio total o diferencial:
        </p>

        {stemTiers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {stemTiers.map((tier, idx) => (
              <div
                key={idx}
                className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white block">
                    {tier.label}
                  </span>
                  <span className="text-[11px] text-[#163422] dark:text-[#5EEAD4] font-bold">
                    {tier.stems} tallos • ${tier.price.toFixed(2)} USD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeStemTier(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar opción"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
            No se han configurado tiers de volumen floral para este producto.
          </div>
        )}

        {/* Formulario rápido para nuevo Tier */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
          <input
            type="text"
            value={newTierLabel}
            onChange={(e) => setNewTierLabel(e.target.value)}
            placeholder="Etiqueta (ej. 50 Rosas Premium)"
            className="p-2.5 border rounded-xl text-xs dark:bg-gray-900 dark:text-white dark:border-gray-800"
          />
          <input
            type="number"
            value={newTierStems}
            onChange={(e) => setNewTierStems(e.target.value)}
            placeholder="Tallos (ej. 50)"
            className="p-2.5 border rounded-xl text-xs dark:bg-gray-900 dark:text-white dark:border-gray-800"
          />
          <input
            type="number"
            step="0.01"
            value={newTierPrice}
            onChange={(e) => setNewTierPrice(e.target.value)}
            placeholder="Precio Total $ (ej. 129.99)"
            className="p-2.5 border rounded-xl text-xs dark:bg-gray-900 dark:text-white dark:border-gray-800"
          />
          <button
            type="button"
            onClick={addStemTier}
            className="bg-[#163422] text-white py-2.5 px-3 rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <Plus size={14} /> Añadir Tier
          </button>
        </div>
      </div>

      {/* 3. INFORMACIÓN SOBRE EL MODIFICADOR DE ROSA EXTRA */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 text-xs bg-pink-50/50 dark:bg-pink-950/20 p-3.5 rounded-xl border border-pink-100 dark:border-pink-900/30">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="text-[#FF97A4] flex-shrink-0" />
          <div>
            <span className="font-bold text-gray-800 dark:text-gray-200 block">
              Modificador de Rosa Extra Activo
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              El precio por rosa adicional se define en la sección superior &quot;Precios, Modificadores e Inventario&quot; y alimenta los botones rápidos (+25, +50, +75) y el stepper en la vista de compra.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
