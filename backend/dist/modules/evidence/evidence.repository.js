"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class EvidenceRepository {
    async uploadEvidence(data) {
        return prisma_1.default.evidence.create({ data });
    }
    async getEvidenceByReportId(reportId) {
        return prisma_1.default.evidence.findMany({
            where: { report_id: reportId }
        });
    }
    async getEvidenceById(evidenceId) {
        return prisma_1.default.evidence.findUnique({
            where: { evidence_id: evidenceId },
            include: { crime_report: true }
        });
    }
    async deleteEvidence(evidenceId) {
        return prisma_1.default.evidence.delete({
            where: { evidence_id: evidenceId }
        });
    }
    // To check permissions
    async findCrimeReportOwner(reportId) {
        return prisma_1.default.crimeReport.findUnique({
            where: { report_id: reportId },
            select: { user_id: true }
        });
    }
}
exports.EvidenceRepository = EvidenceRepository;
