import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterLead extends Document {
  email: string;
  name?: string;
  phone?: string;
  source: "floating_popup" | "footer_form" | "checkout_optin" | "manual_admin";
  appliedTemplateId?: string;
  couponGiven?: string;
  status: "subscribed" | "unsubscribed";
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterLeadSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: ["floating_popup", "footer_form", "checkout_optin", "manual_admin"],
      default: "floating_popup",
    },
    appliedTemplateId: {
      type: String,
      default: "champagne_pill",
    },
    couponGiven: {
      type: String,
      default: "BIENVENIDO10",
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NewsletterLeadSchema.index({ createdAt: -1 });

export const NewsletterLead =
  mongoose.models.NewsletterLead ||
  mongoose.model<INewsletterLead>("NewsletterLead", NewsletterLeadSchema);
