import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../../shared/utils/response';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.analyticsService.getDashboardStats();
      sendSuccess(res, 200, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
