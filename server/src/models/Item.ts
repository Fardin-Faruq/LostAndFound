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

  reporter: mongoose.Types.ObjectId;

  physicalItemReceived?: boolean;
  receivedAt?: Date;
  receivedBy?: mongoose.Types.ObjectId;

  storageReference?: string;
  storageLocation?: string;

  verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'DISPUTED';

  returnedAt?: Date;
  returnedBy?: mongoose.Types.ObjectId;
}

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
    },

    color: {
      type: String,
    },

    location: {
      type: String,
      required: true,
    },

    dateLostOrFound: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String,
    },

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

    physicalItemReceived: {
      type: Boolean,
      default: false,
    },

    receivedAt: {
      type: Date,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    storageReference: {
      type: String,
      trim: true,
    },

    storageLocation: {
      type: String,
      trim: true,
    },

    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'DISPUTED'],
      default: 'UNVERIFIED',
    },

    returnedAt: {
      type: Date,
    },

    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ type: 1, status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ location: 1 });
itemSchema.index({ dateLostOrFound: -1 });
itemSchema.index({ physicalItemReceived: 1 });

export const Item = mongoose.model<IItem>('Item', itemSchema);