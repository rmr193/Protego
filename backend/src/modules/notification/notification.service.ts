import { NotificationRepository } from './notification.repository';
import { AppError } from '../../shared/utils/AppError';
import { broadcastEvent } from '../../shared/services/socket.service';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  // Used internally by other modules
  async createNotification(userId: string, message: string, type: string) {
    const notification = await this.notificationRepository.createNotification({ user_id: userId, message, type });
    broadcastEvent('new_notification', notification);
    broadcastEvent(`notification_${userId}`, notification);
    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.getUserNotifications(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    // Ideally, we'd verify the notification belongs to the user, but for simplicity here:
    // This could also be added to the repository query (where: { notification_id: id, user_id: userId })
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
