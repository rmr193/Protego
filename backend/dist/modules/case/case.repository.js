"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class CaseRepository {
    async createCase(data) {
        return prisma_1.default.case.create({
            data,
            include: {
                crime_report: true,
                police_officer: true
            }
        });
    }
    async findCaseById(id) {
        return prisma_1.default.case.findUnique({
            where: { case_id: id },
            include: {
                crime_report: { select: { user_id: true, crime_type: true, description: true } },
                police_officer: { select: { name: true, badge_number: true } },
                case_trackings: { orderBy: { updated_at: 'desc' } }
            }
        });
    }
    async findAllCases(filters) {
        return prisma_1.default.case.findMany({
            where: filters,
            include: {
                crime_report: { select: { crime_type: true } },
                police_officer: { select: { name: true } }
            },
            orderBy: { assigned_date: 'desc' }
        });
    }
    async addTrackingUpdate(data) {
        return prisma_1.default.caseTracking.create({ data });
    }
    async updateCaseStatus(id, status) {
        return prisma_1.default.case.update({
            where: { case_id: id },
            data: { case_status: status }
        });
    }
}
exports.CaseRepository = CaseRepository;
