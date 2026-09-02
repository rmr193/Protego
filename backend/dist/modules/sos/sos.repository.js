"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOSRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class SOSRepository {
    async triggerAlert(data) {
        return prisma_1.default.sOSAlert.create({
            data: {
                ...data,
                status: 'ACTIVE'
            }
        });
    }
    async findAlertById(id) {
        return prisma_1.default.sOSAlert.findUnique({
            where: { sos_id: id },
            include: { user: { select: { full_name: true, phone: true } } }
        });
    }
    async getActiveAlerts() {
        return prisma_1.default.sOSAlert.findMany({
            where: { status: 'ACTIVE' },
            include: { user: { select: { full_name: true, phone: true } } },
            orderBy: { created_at: 'desc' }
        });
    }
    async updateAlertStatus(id, status) {
        return prisma_1.default.sOSAlert.update({
            where: { sos_id: id },
            data: { status }
        });
    }
}
exports.SOSRepository = SOSRepository;
