"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crime_controller_1 = require("./crime.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const crime_validation_1 = require("./crime.validation");
const router = (0, express_1.Router)();
const crimeController = new crime_controller_1.CrimeController();
// Protect all crime routes
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/crimes
 * @desc    Submit a new Crime Report
 * @access  Private
 */
router.post('/', (0, validate_middleware_1.validate)(crime_validation_1.createCrimeReportSchema), crimeController.createReport);
/**
 * @route   GET /api/v1/crimes
 * @desc    Get all Crime Reports
 * @access  Private (Citizens see own, Police see all)
 */
router.get('/', crimeController.getAllReports);
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
router.patch('/:id/status', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(crime_validation_1.updateCrimeStatusSchema), crimeController.updateStatus);
exports.default = router;
