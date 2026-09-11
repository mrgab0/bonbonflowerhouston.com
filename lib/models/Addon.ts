import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon extends Document {
  name: string;
  price: number;
  image?: string;
  category: string; // e.g. 'Chocolates', 'Peluches', 'Personalización & Tarjetas', 'Decoración'
  type: 'checkbox' | 'text' | 'select'; // 'checkbox' = extra producto, 'text' = mensaje escrito, 'select' = opciones de color
  options?: string[]; // Para opciones de selección ej: ['Rojas', 'Rosadas', 'Blancas']
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const AddonSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  image: { type: String, default: "" },
  category: { type: String, required: true, default: "Otros" },
  type: { type: String, enum: ['checkbox', 'text', 'select'], default: 'checkbox' },
  options: [{ type: String }],
  description: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Addon = mongoose.models.Addon || mongoose.model<IAddon>('Addon', AddonSchema);
