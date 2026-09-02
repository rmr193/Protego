"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class AnalyticsService {
    async getDashboardStats() {
        const [totalUsers, totalCrimes, totalGDs, totalCases, activeSOS, crimesByStatus, crimesByType] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.crimeReport.count(),
            prisma_1.default.generalDiary.count(),
            prisma_1.default.case.count(),
            prisma_1.default.sOSAlert.count({ where: { status: 'ACTIVE' } }),
            // Grouping crimes by status
            prisma_1.default.crimeReport.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            // Grouping crimes by type
            prisma_1.default.crimeReport.groupBy({
                by: ['crime_type'],
                _count: { crime_type: true }
            })
        ]);
        // Format groupBy results
        const statusFormatted = crimesByStatus.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, {});
        const typeFormatted = crimesByType.reduce((acc, curr) => {
            acc[curr.crime_type] = curr._count.crime_type;
            return acc;
        }, {});
        return {
            overview: {
                total_users: totalUsers,
                total_crimes: totalCrimes,
                total_gds: totalGDs,
                total_cases: totalCases,
                active_sos_alerts: activeSOS
            },
            charts: {
                crimes_by_status: statusFormatted,
                crimes_by_type: typeFormatted
            }
        };
    }
}
exports.AnalyticsService = AnalyticsService;
