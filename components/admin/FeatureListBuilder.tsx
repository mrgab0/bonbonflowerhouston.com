"use client";

import { useState } from "react";
import { Plus, Trash2, ListPlus } from "lucide-react";

interface Feature {
  label: string;
  value: string;
}

export function FeatureListBuilder({ initialFeatures = [] }: { initialFeatures?: Feature[] }) {
  const [features, setFeatures] = useState<Feature[]>(
    initialFeatures.length > 0
      ? initialFeatures
      : [
          { label: "Flor Principal", value: "Rosas de Invernadero" },
          { label: "Empaque", value: "Caja Deluxe de Regalo" },
        ]
  );

  const addFeature = () => {
    setFeatures([...features, { label: "", value: "" }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: "label" | "value", text: string) => {
    const updated = [...features];
    updated[index][field] = text;
    setFeatures(updated);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <ListPlus size={16} className="text-[#FF97A4]" /> Viñetas y Especificaciones Destacadas
        </label>
        <button
          type="button"
          onClick={addFeature}
          className="text-xs font-bold text-[#FF97A4] hover:text-[#B0004A] flex items-center gap-1 bg-[#FF97A4]/10 px-3 py-1 rounded-full hover:bg-[#FF97A4]/20 transition-all"
        >
          <Plus size={14} /> Añadir Viñeta
        </button>
      </div>

      <p className="text-[11px] text-gray-400">
        Añade puntos clave en formato título/valor (ej. "Duración": "7 a 10 días" o "Incluye": "Tarjeta personalizada")
      </p>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              name="featureLabels"
              value={feature.label}
              onChange={(e) => handleChange(index, "label", e.target.value)}
              placeholder="Ej: Incluye"
              className="p-2.5 border rounded-xl text-xs w-1/3 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
            />
            <input
              name="featureValues"
              value={feature.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              placeholder="Ej: Tarjeta de Dedicatoria Gratis"
              className="p-2.5 border rounded-xl text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar viñeta"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
