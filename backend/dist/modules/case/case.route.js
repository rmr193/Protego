"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const case_controller_1 = require("./case.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const case_validation_1 = require("./case.validation");
const router = (0, express_1.Router)();
const caseController = new case_controller_1.CaseController();
// Protect all case routes
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/cases
 * @desc    Create a case and assign an officer to a crime report
 * @access  Private (Police_Officer Only)
 */
router.post('/', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(case_validation_1.createCaseSchema), caseController.createCase);
/**
 * @route   GET /api/v1/cases
 * @desc    Get all cases (Officers can filter by their ID)
 * @access  Private (Police_Officer)
 */
router.get('/', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), caseController.getAllCases);
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
router.post('/:id/tracking', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(case_validation_1.addTrackingSchema), caseController.addTrackingUpdate);
exports.default = router;
