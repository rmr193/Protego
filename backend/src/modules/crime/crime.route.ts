import { Router } from 'express';
import { CrimeController } from './crime.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createCrimeReportSchema, updateCrimeStatusSchema } from './crime.validation';

const router = Router();
const crimeController = new CrimeController();

// Protect all crime routes
router.use(authenticate);

/**
 * @route   POST /api/v1/crimes
 * @desc    Submit a new Crime Report
 * @access  Private
 */
router.post('/', validate(createCrimeReportSchema), crimeController.createReport);

router.get('/', crimeController.getAllReports);

/**
 * @route   GET /api/v1/crimes/map
 * @desc    Get all public crime reports for map visualization
 * @access  Private (All authenticated citizens & police)
 */
router.get('/map', crimeController.getMapReports);

/**
 * @route   GET /api/v1/crimes/:id
 * @desc    Get specific Crime Report
 * @access  Private
 */
router.get('/:id', crimeController.getReport);

/**
 * @route   PATCH /api/v1/crimes/:id/status
 * @desc    Update crime status
 * @access  Private (Police_Officer)
 */
router.patch('/:id/status', restrictTo('POLICE_OFFICER'), validate(updateCrimeStatusSchema), crimeController.updateStatus);

export default router;
