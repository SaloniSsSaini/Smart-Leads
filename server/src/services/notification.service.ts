import { Notification } from '../models/Notification.model';
import { getIO } from '../socket';

export const createNotification = async (data: {
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type?: 'lead' | 'billing' | 'system';
  link?: string;
  broadcastToOrg?: boolean;
}): Promise<void> => {
  const notification = await Notification.create({
    userId: data.userId,
    organizationId: data.organizationId,
    title: data.title,
    message: data.message,
    type: data.type ?? 'system',
    link: data.link,
  });

  const payload = {
    id: notification._id.toString(),
    title: data.title,
    message: data.message,
    type: data.type ?? 'system',
    link: data.link,
    read: false,
    createdAt: notification.createdAt,
  };

  try {
    const io = getIO();
    if (data.broadcastToOrg) {
      io.to(`org:${data.organizationId}`).emit('notification', payload);
    } else {
      io.to(`user:${data.userId}`).emit('notification', payload);
    }
  } catch {
    // Socket not initialized (tests)
  }
};

export const getNotifications = async (userId: string, limit = 20) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
};

export const markAsRead = async (userId: string, notificationId: string) => {
  await Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true });
};

export const markAllRead = async (userId: string) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
};

export const getUnreadCount = async (userId: string) => {
  return Notification.countDocuments({ userId, read: false });
};
