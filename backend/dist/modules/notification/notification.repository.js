"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class NotificationRepository {
    async createNotification(data) {
        return prisma_1.default.notification.create({ data });
    }
    async getUserNotifications(userId) {
        return prisma_1.default.notification.findMany({
            where: { user_id: userId },
            orderBy: { sent_at: 'desc' }
        });
    }
    async markAsRead(notificationId) {
        return prisma_1.default.notification.update({
            where: { notification_id: notificationId },
            data: { status: 'READ' }
        });
    }
    async markAllAsRead(userId) {
        return prisma_1.default.notification.updateMany({
            where: { user_id: userId, status: 'UNREAD' },
            data: { status: 'READ' }
        });
    }
}
exports.NotificationRepository = NotificationRepository;
