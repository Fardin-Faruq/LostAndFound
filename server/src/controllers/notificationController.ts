import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { notificationService } from '../services/notificationService';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const notifications = await notificationService.getUserNotifications(String(req.user._id));
    const unreadCount = await notificationService.getUnreadCount(String(req.user._id));

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await notificationService.markAsRead(id, String(req.user._id));
    if (!updated) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    await notificationService.markAllAsRead(String(req.user._id));
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
