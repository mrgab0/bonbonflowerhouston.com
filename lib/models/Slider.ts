import mongoose, { Schema, Document } from 'mongoose';

export interface ISlider extends Document {
  type: 'banner' | 'spotlight';
  title?: string;
  description?: string;
  image?: string; // Banner Escritorio
  mobileImage?: string; // Banner Móvil (Android/iOS)
  link?: string;
  ctaText?: string; // Texto del botón (ej. "Comprar Ahora", "Ver Oferta")
  showOverlay?: boolean; // Mostrar/Ocultar texto y botón sobre la imagen
  order?: number; // Orden de prioridad
  
  // Para spotlight
  products?: mongoose.Types.ObjectId[];
  discountPercentage?: number;
  discountExpiry?: Date;
  
  isActive: boolean;
  createdAt: Date;
}

const SliderSchema: Schema = new Schema({
  type: { type: String, enum: ['banner', 'spotlight'], required: true },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  mobileImage: { type: String },
  link: { type: String },
  ctaText: { type: String, default: "Ver Oferta" },
  showOverlay: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  discountPercentage: { type: Number },
  discountExpiry: { type: Date },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);
