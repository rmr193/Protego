import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// All notification routes are private
router.use(authenticate);

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

export default router;
