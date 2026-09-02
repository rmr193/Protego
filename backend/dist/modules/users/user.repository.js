"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class UserRepository {
    async findById(id) {
        return prisma_1.default.user.findUnique({
            where: { user_id: id },
            include: { role: true },
        });
    }
    async findAll(skip, take) {
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                skip,
                take,
                include: { role: true },
                orderBy: { created_at: 'desc' }
            }),
            prisma_1.default.user.count()
        ]);
        return { users, total };
    }
    async update(id, data) {
        return prisma_1.default.user.update({
            where: { user_id: id },
            data,
            include: { role: true }
        });
    }
    async delete(id) {
        return prisma_1.default.user.delete({
            where: { user_id: id }
        });
    }
}
exports.UserRepository = UserRepository;
