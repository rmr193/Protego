import { Router } from 'express';
import { GDController } from './gd.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createGDSchema, updateGDStatusSchema } from './gd.validation';

const router = Router();
const gdController = new GDController();

// All GD routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/gd
 * @desc    File a new General Diary
 * @access  Private
 */
router.post('/', validate(createGDSchema), gdController.createGD);

/**
 * @route   GET /api/v1/gd
 * @desc    Get all GDs (Citizens see only their own, Police see all)
 * @access  Private
 */
router.get('/', gdController.getAllGDs);

/**
 * @route   GET /api/v1/gd/map
 * @desc    Get all public GD reports for map visualization
 * @access  Private (All authenticated citizens & police)
 */
router.get('/map', gdController.getMapGDs);

/**
 * @route   GET /api/v1/gd/:id
 * @desc    Get a specific GD by ID
 * @access  Private
 */
router.get('/:id', gdController.getGD);

/**
 * @route   PATCH /api/v1/gd/:id/status
 * @desc    Update GD status (Pending, Approved, Rejected)
 * @access  Private (Police_Officer)
 */
router.patch('/:id/status', restrictTo('POLICE_OFFICER'), validate(updateGDStatusSchema), gdController.updateStatus);

export default router;
