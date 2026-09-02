"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class AIRepository {
    async saveAnalysis(data) {
        const payload = {
            report_id: data.report_id,
            severity_score: data.severity_score,
            is_fake: data.is_fake,
            analysis_data: {
                fake_probability: data.fake_probability,
                category: data.category
            }
        };
        const existing = await prisma_1.default.aIAnalysis.findUnique({
            where: { report_id: data.report_id }
        });
        if (existing) {
            return prisma_1.default.aIAnalysis.update({
                where: { analysis_id: existing.analysis_id },
                data: payload
            });
        }
        return prisma_1.default.aIAnalysis.create({ data: payload });
    }
    async getAnalysisByReportId(reportId) {
        return prisma_1.default.aIAnalysis.findUnique({
            where: { report_id: reportId }
        });
    }
}
exports.AIRepository = AIRepository;
