import mongoose from 'mongoose';

export interface IClaim extends mongoose.Document {
  item: mongoose.Schema.Types.ObjectId;
  claimant: mongoose.Schema.Types.ObjectId;
  proofDetails: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

export const Claim = mongoose.model<IClaim>('Claim', claimSchema);
