import mongoose from 'mongoose';

export type NotificationType =
  | 'POSSIBLE_MATCH'
  | 'CLAIM_SUBMITTED'
  | 'CLAIM_STATUS_UPDATED'
  | 'ITEM_RECEIVED'
  | 'ITEM_RETURNED'
  | 'SYSTEM';

export interface INotification extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedItem?: mongoose.Schema.Types.ObjectId;
  relatedClaim?: mongoose.Schema.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'POSSIBLE_MATCH',
        'CLAIM_SUBMITTED',
        'CLAIM_STATUS_UPDATED',
        'ITEM_RECEIVED',
        'ITEM_RETURNED',
        'SYSTEM',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
