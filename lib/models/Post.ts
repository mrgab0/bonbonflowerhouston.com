import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  mainImage: string;
  published: boolean;
  createdAt: Date;
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  mainImage: { type: String },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
