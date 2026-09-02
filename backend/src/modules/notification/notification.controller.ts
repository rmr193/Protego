import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const notifications = await this.notificationService.getUserNotifications(req.user!.id);
      sendSuccess(res, 200, notifications);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAsRead(req.params.id as string, req.user!.id);
      sendSuccess(res, 200, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, 200, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  };
}
