"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const analytics_service_1 = require("./analytics.service");
const prisma_1 = __importDefault(require("../../core/prisma"));
describe('AnalyticsService', () => {
    let analyticsService;
    beforeEach(() => {
        analyticsService = new analytics_service_1.AnalyticsService();
    });
    describe('getDashboardStats', () => {
        it('should aggregate and return dashboard metrics', async () => {
            jest.spyOn(prisma_1.default.user, 'count').mockResolvedValue(100);
            jest.spyOn(prisma_1.default.crimeReport, 'count').mockResolvedValue(50);
            jest.spyOn(prisma_1.default.generalDiary, 'count').mockResolvedValue(30);
            jest.spyOn(prisma_1.default.case, 'count').mockResolvedValue(20);
            jest.spyOn(prisma_1.default.sOSAlert, 'count').mockResolvedValue(5);
            jest.spyOn(prisma_1.default.crimeReport, 'groupBy')
                .mockResolvedValueOnce([{ status: 'PENDING', _count: { status: 10 } }])
                .mockResolvedValueOnce([{ crime_type: 'Theft', _count: { crime_type: 5 } }]);
            const result = await analyticsService.getDashboardStats();
            expect(result.overview.total_users).toBe(100);
            expect(result.overview.active_sos_alerts).toBe(5);
            expect(result.charts.crimes_by_status['PENDING']).toBe(10);
            expect(result.charts.crimes_by_type['Theft']).toBe(5);
        });
    });
});
