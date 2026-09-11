import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 15 for 15% or 10 for $10 USD
  maxUses: number; // e.g. 10 for first 10 customers
  usedCount: number;
  isActive: boolean;
  isAutoLaunch?: boolean; // If true, automatically applies for first N orders
  minPurchase?: number;
  createdAt: Date;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, uppercase: true, trim: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  maxUses: { type: Number, default: 10 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isAutoLaunch: { type: Boolean, default: false },
  minPurchase: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
