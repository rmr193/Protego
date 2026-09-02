"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class CrimeRepository {
    async createReport(data) {
        return prisma_1.default.crimeReport.create({ data });
    }
    async findReportById(id) {
        return prisma_1.default.crimeReport.findUnique({
            where: { report_id: id },
            include: {
                user: { select: { full_name: true, email: true, phone: true } },
                evidence: true,
                ai_analysis: true
            }
        });
    }
    async findAllReports(filters, skip, take) {
        const [reports, total] = await Promise.all([
            prisma_1.default.crimeReport.findMany({
                where: filters,
                skip,
                take,
                include: {
                    user: { select: { full_name: true, phone: true } },
                    ai_analysis: { select: { severity_score: true, is_fake: true } }
                },
                orderBy: { date_time: 'desc' }
            }),
            prisma_1.default.crimeReport.count({ where: filters })
        ]);
        return { reports, total };
    }
    async updateReportStatus(id, status) {
        return prisma_1.default.crimeReport.update({
            where: { report_id: id },
            data: { status }
        });
    }
}
exports.CrimeRepository = CrimeRepository;
