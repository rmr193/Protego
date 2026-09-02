"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gd_controller_1 = require("./gd.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const gd_validation_1 = require("./gd.validation");
const router = (0, express_1.Router)();
const gdController = new gd_controller_1.GDController();
// All GD routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/gd
 * @desc    File a new General Diary
 * @access  Private
 */
router.post('/', (0, validate_middleware_1.validate)(gd_validation_1.createGDSchema), gdController.createGD);
/**
 * @route   GET /api/v1/gd
 * @desc    Get all GDs (Citizens see only their own, Police see all)
 * @access  Private
 */
router.get('/', gdController.getAllGDs);
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
router.patch('/:id/status', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(gd_validation_1.updateGDStatusSchema), gdController.updateStatus);
exports.default = router;
