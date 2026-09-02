"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// All notification routes are private
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/v1/notifications
 * @desc    Get all notifications for the logged in user
 * @access  Private
 */
router.get('/', notificationController.getNotifications);
/**
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @desc    Mark all unread notifications as read
 * @access  Private
 */
router.patch('/mark-all-read', notificationController.markAllAsRead);
/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch('/:id/read', notificationController.markAsRead);
exports.default = router;
