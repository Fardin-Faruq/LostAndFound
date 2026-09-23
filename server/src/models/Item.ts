import mongoose from 'mongoose';

export interface IItem extends mongoose.Document {
  type: 'LOST' | 'FOUND';
  title: string;
  category: string;
  description: string;
  brand?: string;
  color?: string;
  location: string;
  dateLostOrFound: Date;
  imageUrl?: string;
  status: 'REPORTED' | 'MATCH_FOUND' | 'CLAIMED' | 'RETURNED' | 'CLOSED';
  reporter: mongoose.Schema.Types.ObjectId;
}

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true,
    },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String },
    color: { type: String },
    location: { type: String, required: true },
    dateLostOrFound: { type: Date, required: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ['REPORTED', 'MATCH_FOUND', 'CLAIMED', 'RETURNED', 'CLOSED'],
      default: 'REPORTED',
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Item = mongoose.model<IItem>('Item', itemSchema);
