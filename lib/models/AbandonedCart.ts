import mongoose, { Schema, Document } from "mongoose";

export interface IAbandonedCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: any[];
}

export interface IAbandonedCart extends Document {
  cartToken: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: IAbandonedCartItem[];
  subtotal: number;
  stepReached: "customer_info" | "delivery_selected" | "payment_method";
  recoveryStatus: "abandoned" | "reminder_1_sent" | "reminder_2_sent" | "recovered" | "expired";
  recoveryEmailSentAt?: Date;
  recoveredOrderId?: string;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCartSchema: Schema = new Schema(
  {
    cartToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String, default: "" },
        addons: { type: Schema.Types.Mixed, default: [] },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    stepReached: {
      type: String,
      enum: ["customer_info", "delivery_selected", "payment_method"],
      default: "customer_info",
    },
    recoveryStatus: {
      type: String,
      enum: ["abandoned", "reminder_1_sent", "reminder_2_sent", "recovered", "expired"],
      default: "abandoned",
      index: true,
    },
    recoveryEmailSentAt: {
      type: Date,
      default: null,
    },
    recoveredOrderId: {
      type: String,
      default: "",
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AbandonedCartSchema.index({ createdAt: -1 });
AbandonedCartSchema.index({ recoveryStatus: 1, lastActivityAt: -1 });

export const AbandonedCart =
  mongoose.models.AbandonedCart ||
  mongoose.model<IAbandonedCart>("AbandonedCart", AbandonedCartSchema);
