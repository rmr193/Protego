import { Router } from 'express';
import { SOSController } from './sos.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { triggerSOSSchema } from './sos.validation';

const router = Router();
const sosController = new SOSController();

// Protect all SOS routes
router.use(authenticate);

/**
 * @route   POST /api/v1/sos
 * @desc    Trigger an emergency SOS alert
 * @access  Private
 */
router.post('/', validate(triggerSOSSchema), sosController.triggerSOS);

/**
 * @route   GET /api/v1/sos/active
 * @desc    Get all active SOS alerts
 * @access  Private (Police_Officer)
 */
router.get('/active', restrictTo('POLICE_OFFICER'), sosController.getActiveAlerts);

/**
 * @route   GET /api/v1/sos/my-active
 * @desc    Get user's current active SOS alert
 * @access  Private
 */
router.get('/my-active', sosController.getMyActiveAlert);

/**
 * @route   GET /api/v1/sos/:id
 * @desc    Get a specific SOS alert
 * @access  Private
 */
router.get('/:id', sosController.getAlert);

/**
 * @route   PATCH /api/v1/sos/:id/resolve
 * @desc    Mark an SOS alert as RESOLVED
 * @access  Private (Police_Officer, Citizen)
 */
router.patch('/:id/resolve', restrictTo('POLICE_OFFICER', 'CITIZEN'), sosController.resolveAlert);

export default router;
