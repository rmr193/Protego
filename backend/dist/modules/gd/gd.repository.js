"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class GDRepository {
    async createGD(data) {
        return prisma_1.default.generalDiary.create({ data });
    }
    async findGDById(id) {
        return prisma_1.default.generalDiary.findUnique({
            where: { gd_id: id },
            include: { user: { select: { full_name: true, email: true, phone: true } } }
        });
    }
    async findAllGDs(filters, skip, take) {
        const [gds, total] = await Promise.all([
            prisma_1.default.generalDiary.findMany({
                where: filters,
                skip,
                take,
                include: { user: { select: { full_name: true, phone: true } } },
                orderBy: { created_at: 'desc' }
            }),
            prisma_1.default.generalDiary.count({ where: filters })
        ]);
        return { gds, total };
    }
    async updateGD(id, data) {
        return prisma_1.default.generalDiary.update({
            where: { gd_id: id },
            data
        });
    }
}
exports.GDRepository = GDRepository;
