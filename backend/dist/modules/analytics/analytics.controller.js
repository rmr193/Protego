"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("./analytics.service");
const response_1 = require("../../shared/utils/response");
class AnalyticsController {
    analyticsService;
    constructor() {
        this.analyticsService = new analytics_service_1.AnalyticsService();
    }
    getDashboardStats = async (req, res, next) => {
        try {
            const stats = await this.analyticsService.getDashboardStats();
            (0, response_1.sendSuccess)(res, 200, stats, 'Dashboard statistics retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AnalyticsController = AnalyticsController;
