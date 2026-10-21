import mongoose, { Schema, Document } from "mongoose";

export interface IEmailMessage extends Document {
  direction: "inbound" | "outbound";
  type:
    | "contact_form"
    | "direct_email"
    | "order_receipt"
    | "quote"
    | "delivery_update"
    | "abandoned_cart_recovery"
    | "newsletter_welcome"
    | "marketing_campaign"
    | "incoming_reply"
    | "general";
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  bodyText?: string;
  bodyHtml: string;
  status: "sent" | "received" | "failed" | "draft";
  isRead: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  mailboxEmail?: string;
  orderId?: string;
  resendMessageId?: string;
  bccAdmins?: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size?: number;
    mimeType?: string;
  }>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailMessageSchema: Schema = new Schema(
  {
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
      default: "outbound",
    },
    type: {
      type: String,
      enum: [
        "contact_form",
        "direct_email",
        "order_receipt",
        "quote",
        "delivery_update",
        "abandoned_cart_recovery",
        "newsletter_welcome",
        "marketing_campaign",
        "incoming_reply",
        "general",
      ],
      default: "general",
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    mailboxEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    to: {
      type: [String],
      required: true,
      default: [],
    },
    replyTo: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    bodyText: {
      type: String,
      default: "",
    },
    bodyHtml: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "received", "failed", "draft"],
      default: "sent",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    orderId: {
      type: String,
      trim: true,
    },
    resendMessageId: {
      type: String,
      trim: true,
    },
    bccAdmins: {
      type: Boolean,
      default: true,
    },
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

EmailMessageSchema.index({ createdAt: -1 });
EmailMessageSchema.index({ isRead: 1, direction: 1 });
EmailMessageSchema.index({ customerEmail: 1 });
EmailMessageSchema.index({ orderId: 1 });
EmailMessageSchema.index({ type: 1 });

export const EmailMessage =
  mongoose.models.EmailMessage ||
  mongoose.model<IEmailMessage>("EmailMessage", EmailMessageSchema);
