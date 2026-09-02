import { Router } from 'express';
import { AIController } from './ai.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { analyzeReportSchema } from './ai.validation';

const router = Router();
const aiController = new AIController();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/ai/analyze
 * @desc    Submit a report description for AI analysis
 * @access  Private (Police_Officer)
 */
router.post('/analyze', restrictTo('POLICE_OFFICER'), validate(analyzeReportSchema), aiController.analyzeReport);

/**
 * @route   GET /api/v1/ai/:reportId
 * @desc    Get AI analysis for a specific report
 * @access  Private (Police_Officer)
 */
router.get('/:reportId', restrictTo('POLICE_OFFICER'), aiController.getAnalysis);

export default router;
