"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const ai_validation_1 = require("./ai.validation");
const router = (0, express_1.Router)();
const aiController = new ai_controller_1.AIController();
// All AI routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/ai/analyze
 * @desc    Submit a report description for AI analysis
 * @access  Private (Police_Officer)
 */
router.post('/analyze', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(ai_validation_1.analyzeReportSchema), aiController.analyzeReport);
/**
 * @route   GET /api/v1/ai/:reportId
 * @desc    Get AI analysis for a specific report
 * @access  Private (Police_Officer)
 */
router.get('/:reportId', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), aiController.getAnalysis);
exports.default = router;
