import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Only Police Officers should see full system analytics
router.use(authenticate, restrictTo('POLICE_OFFICER'));

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get aggregated system statistics
 * @access  Private (Police_Officer)
 */
router.get('/dashboard', analyticsController.getDashboardStats);

export default router;
