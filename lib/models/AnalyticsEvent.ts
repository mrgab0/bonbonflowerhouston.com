import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsEvent extends Document {
  type: "visit" | "product_view" | "cart_add" | "cart_abandon" | "checkout_start" | "purchase";
  path: string;
  productId?: string;
  productName?: string;
  price?: number;
  referrer?: string; // "google", "instagram", "whatsapp", "facebook", "direct"
  device?: "mobile" | "desktop" | "tablet";
  ipHash?: string;
  customerName?: string;
  customerPhone?: string;
  cartItems?: Array<{
    productId: string;
    name: string;
    price: number;
    image?: string;
  }>;
  createdAt: Date;
}

const AnalyticsEventSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ["visit", "product_view", "cart_add", "cart_abandon", "checkout_start", "purchase"],
    required: true
  },
  path: { type: String, required: true },
  productId: { type: String, default: "" },
  productName: { type: String, default: "" },
  price: { type: Number, default: 0 },
  referrer: { type: String, default: "direct" },
  device: { type: String, default: "desktop" },
  ipHash: { type: String, default: "" },
  customerName: { type: String, default: "" },
  customerPhone: { type: String, default: "" },
  cartItems: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String
    }
  ],
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 } // Autolimpiado tras 90 días para cuidar el almacenamiento
});

// Índices para consultas ultra rápidas en el Dashboard
AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ referrer: 1 });
AnalyticsEventSchema.index({ createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
