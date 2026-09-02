import prisma from '../../core/prisma';

export class NotificationRepository {
  async createNotification(data: { user_id: string; message: string; type: string }) {
    return prisma.notification.create({ data });
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { sent_at: 'desc' }
    });
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { notification_id: notificationId },
      data: { status: 'READ' }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { user_id: userId, status: 'UNREAD' },
      data: { status: 'READ' }
    });
  }
}
