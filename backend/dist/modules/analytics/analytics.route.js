"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const analyticsController = new analytics_controller_1.AnalyticsController();
// Only Police Officers should see full system analytics
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'));
/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get aggregated system statistics
 * @access  Private (Police_Officer)
 */
router.get('/dashboard', analyticsController.getDashboardStats);
exports.default = router;
