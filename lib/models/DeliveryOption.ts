import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryOption extends Document {
  title: string;
  description: string;
  estimatedTimeMinutes: number;
  estimatedTimeLabel: string;
  extraPrice: number;
  pricePerMile: number;
  badge?: string;
  iconName: string;
  isActive: boolean;
  order: number;
}

const DeliveryOptionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  estimatedTimeMinutes: { type: Number, default: 60 },
  estimatedTimeLabel: { type: String, required: true },
  extraPrice: { type: Number, default: 0 },
  pricePerMile: { type: Number, default: 1.50 },
  badge: { type: String, default: "" },
  iconName: { type: String, default: "Truck" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

export const DeliveryOptionModel =
  mongoose.models.DeliveryOption || mongoose.model<IDeliveryOption>('DeliveryOption', DeliveryOptionSchema);
