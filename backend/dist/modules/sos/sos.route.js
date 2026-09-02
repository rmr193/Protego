"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sos_controller_1 = require("./sos.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const sos_validation_1 = require("./sos.validation");
const router = (0, express_1.Router)();
const sosController = new sos_controller_1.SOSController();
// Protect all SOS routes
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/sos
 * @desc    Trigger an emergency SOS alert
 * @access  Private
 */
router.post('/', (0, validate_middleware_1.validate)(sos_validation_1.triggerSOSSchema), sosController.triggerSOS);
/**
 * @route   GET /api/v1/sos/active
 * @desc    Get all active SOS alerts
 * @access  Private (Police_Officer)
 */
router.get('/active', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), sosController.getActiveAlerts);
/**
 * @route   GET /api/v1/sos/:id
 * @desc    Get a specific SOS alert
 * @access  Private
 */
router.get('/:id', sosController.getAlert);
/**
 * @route   PATCH /api/v1/sos/:id/resolve
 * @desc    Mark an SOS alert as RESOLVED
 * @access  Private (Police_Officer)
 */
router.patch('/:id/resolve', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), sosController.resolveAlert);
exports.default = router;
