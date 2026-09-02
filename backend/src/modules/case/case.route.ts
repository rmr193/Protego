import { Router } from 'express';
import { CaseController } from './case.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createCaseSchema, addTrackingSchema } from './case.validation';

const router = Router();
const caseController = new CaseController();

// Protect all case routes
router.use(authenticate);

/**
 * @route   POST /api/v1/cases
 * @desc    Create a case and assign an officer to a crime report
 * @access  Private (Police_Officer Only)
 */
router.post('/', restrictTo('POLICE_OFFICER'), validate(createCaseSchema), caseController.createCase);

/**
 * @route   GET /api/v1/cases
 * @desc    Get all cases (Officers can filter by their ID)
 * @access  Private (Police_Officer)
 */
router.get('/', restrictTo('POLICE_OFFICER'), caseController.getAllCases);

/**
 * @route   GET /api/v1/cases/:id
 * @desc    Get a specific case with its tracking history
 * @access  Private
 */
router.get('/:id', caseController.getCase);

/**
 * @route   POST /api/v1/cases/:id/tracking
 * @desc    Add a tracking update to a case
 * @access  Private (Police_Officer)
 */
router.post('/:id/tracking', restrictTo('POLICE_OFFICER'), validate(addTrackingSchema), caseController.addTrackingUpdate);

export default router;
