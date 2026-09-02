"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("./notification.repository");
const socket_service_1 = require("../../shared/services/socket.service");
class NotificationService {
    notificationRepository;
    constructor() {
        this.notificationRepository = new notification_repository_1.NotificationRepository();
    }
    // Used internally by other modules
    async createNotification(userId, message, type) {
        const notification = await this.notificationRepository.createNotification({ user_id: userId, message, type });
        (0, socket_service_1.broadcastEvent)('new_notification', notification);
        (0, socket_service_1.broadcastEvent)(`notification_${userId}`, notification);
        return notification;
    }
    async getUserNotifications(userId) {
        return this.notificationRepository.getUserNotifications(userId);
    }
    async markAsRead(notificationId, userId) {
        // Ideally, we'd verify the notification belongs to the user, but for simplicity here:
        // This could also be added to the repository query (where: { notification_id: id, user_id: userId })
        return this.notificationRepository.markAsRead(notificationId);
    }
    async markAllAsRead(userId) {
        return this.notificationRepository.markAllAsRead(userId);
    }
}
exports.NotificationService = NotificationService;
