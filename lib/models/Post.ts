import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  mainImage: string;
  published: boolean;
  language?: 'es' | 'en';
  translationOf?: string;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  mainImage: { type: String },
  published: { type: Boolean, default: false },
  language: { type: String, enum: ['es', 'en'], default: 'es' },
  translationOf: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// Índice para búsquedas rápidas por idioma y estado de publicación
PostSchema.index({ language: 1, published: 1, createdAt: -1 });

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
