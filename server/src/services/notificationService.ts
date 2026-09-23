import { Notification, INotification, NotificationType } from '../models/Notification';
import { IItem } from '../models/Item';
import { IClaim } from '../models/Claim';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedItemId?: string;
  relatedClaimId?: string;
}

export class NotificationService {
  async createNotification(params: CreateNotificationParams): Promise<INotification> {
    const notification = await Notification.create({
      user: params.userId as any,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedItem: params.relatedItemId as any,
      relatedClaim: params.relatedClaimId as any,
    });
    return notification;
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await Notification.find({ user: userId as any })
      .populate('relatedItem', 'title type status location imageUrl')
      .populate('relatedClaim', 'status proofDetails')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId as any },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ user: userId as any, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ user: userId as any, isRead: false });
  }

  // Trigger Helpers
  async notifyPossibleMatch(
    lostItemReporterId: string,
    lostItem: IItem,
    foundItem: IItem,
    score: number
  ): Promise<void> {
    await this.createNotification({
      userId: lostItemReporterId,
      type: 'POSSIBLE_MATCH',
      title: `Possible Match Found (${score}%)`,
      message: `A found item "${foundItem.title}" resembles your reported lost item "${lostItem.title}".`,
      relatedItemId: String(foundItem._id),
    });
  }

  async notifyItemReceivedByOffice(
    reporterId: string,
    item: IItem,
    storageLocation?: string
  ): Promise<void> {
    const locationInfo = storageLocation ? ` at location: ${storageLocation}` : '';
    await this.createNotification({
      userId: reporterId,
      type: 'ITEM_RECEIVED',
      title: 'Item Received at Office',
      message: `The physical item "${item.title}" has been verified and stored in the campus Lost & Found office${locationInfo}.`,
      relatedItemId: String(item._id),
    });
  }

  async notifyClaimStatusUpdate(
    claimantId: string,
    claim: IClaim,
    status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW',
    rejectionReason?: string
  ): Promise<void> {
    let message = `Your claim status has been updated to ${status}.`;
    if (status === 'APPROVED') {
      message = 'Your claim has been APPROVED! Please visit the campus Lost & Found office with your ID to collect your item.';
    } else if (status === 'REJECTED') {
      message = `Your claim was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
    }

    const itemId = (claim.item as any)?._id
      ? String((claim.item as any)._id)
      : claim.item
      ? String(claim.item)
      : undefined;

    await this.createNotification({
      userId: (claimantId as any)?._id ? String((claimantId as any)._id) : String(claimantId),
      type: 'CLAIM_STATUS_UPDATED',
      title: `Claim ${status}`,
      message,
      relatedItemId: itemId,
      relatedClaimId: String(claim._id),
    });
  }

  async notifyItemReturned(claimantId: string, item: IItem): Promise<void> {
    await this.createNotification({
      userId: claimantId,
      type: 'ITEM_RETURNED',
      title: 'Item Handover Complete',
      message: `Item "${item.title}" has been successfully handed over and marked as RETURNED. Thank you for using Lost2Found!`,
      relatedItemId: String(item._id),
    });
  }
}

export const notificationService = new NotificationService();
