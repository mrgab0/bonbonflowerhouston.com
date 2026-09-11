import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  address: string;
  destLat?: number;
  destLng?: number;
  distanceMiles?: number;
  googleMapsUrl?: string;
  deliveryMethod?: string;
  deliveryFee?: number;
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  cardMessage?: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; addons?: any[] }>;
  total: number;
  paymentMethod: string;
  paymentRef: string;
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: "" },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  destLat: { type: Number, default: 0 },
  destLng: { type: Number, default: 0 },
  distanceMiles: { type: Number, default: 0 },
  googleMapsUrl: { type: String, default: "" },
  deliveryMethod: { type: String, default: "Envío Estándar" },
  deliveryFee: { type: Number, default: 0 },
  couponCode: { type: String, default: "" },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  cardMessage: { type: String, default: "" },
  items: [{ id: String, name: String, price: Number, quantity: Number, addons: Schema.Types.Mixed }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentRef: { type: String, required: true },
  status: { 
    type: String, 
    default: "En diseño",
  },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
