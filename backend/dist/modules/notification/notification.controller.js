"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const response_1 = require("../../shared/utils/response");
class NotificationController {
    notificationService;
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    getNotifications = async (req, res, next) => {
        try {
            const notifications = await this.notificationService.getUserNotifications(req.user.id);
            (0, response_1.sendSuccess)(res, 200, notifications);
        }
        catch (error) {
            next(error);
        }
    };
    markAsRead = async (req, res, next) => {
        try {
            await this.notificationService.markAsRead(req.params.id, req.user.id);
            (0, response_1.sendSuccess)(res, 200, null, 'Notification marked as read');
        }
        catch (error) {
            next(error);
        }
    };
    markAllAsRead = async (req, res, next) => {
        try {
            await this.notificationService.markAllAsRead(req.user.id);
            (0, response_1.sendSuccess)(res, 200, null, 'All notifications marked as read');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.NotificationController = NotificationController;
