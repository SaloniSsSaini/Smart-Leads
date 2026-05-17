import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.getNotifications(req.user!.userId);
  const data = notifications.map((n) => ({
    id: String(n._id),
    title: n.title,
    message: n.message,
    type: n.type,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt,
  }));
  res.json({ success: true, data });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.json({ success: true, data: { count } });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAsRead(req.user!.userId, req.params.id as string);
  res.json({ success: true, message: 'Marked as read' });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.user!.userId);
  res.json({ success: true, message: 'All marked as read' });
});
