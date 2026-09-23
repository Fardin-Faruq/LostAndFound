import mongoose from 'mongoose';

export interface IClaim extends mongoose.Document {
  item: mongoose.Types.ObjectId;
  claimant: mongoose.Types.ObjectId;
  proofDetails: string;
  explanation?: string;
  whereLost?: string;
  approximateDate?: Date;
  identifyingCharacteristics?: string;
  status:
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
}

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },

    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    proofDetails: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      trim: true,
    },

    whereLost: {
      type: String,
      trim: true,
    },

    approximateDate: {
      type: Date,
    },

    identifyingCharacteristics: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'PENDING',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'CANCELLED',
      ],
      default: 'PENDING',
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    reviewedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ claimant: 1 });
claimSchema.index({ status: 1 });

export const Claim = mongoose.model<IClaim>('Claim', claimSchema);