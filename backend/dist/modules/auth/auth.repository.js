"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class AuthRepository {
    async findUserByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
            include: { role: true }
        });
    }
    async findRoleByName(roleName) {
        return prisma_1.default.role.findUnique({
            where: { name: roleName }
        });
    }
    async createUser(data) {
        return prisma_1.default.user.create({
            data,
            include: { role: true }
        });
    }
    async createRefreshToken(userId, token, expiresAt) {
        return prisma_1.default.refreshToken.create({
            data: {
                user_id: userId,
                token,
                expires_at: expiresAt
            }
        });
    }
    async findRefreshToken(token) {
        return prisma_1.default.refreshToken.findUnique({
            where: { token },
            include: { user: { include: { role: true } } }
        });
    }
    async deleteRefreshToken(token) {
        return prisma_1.default.refreshToken.delete({
            where: { token }
        });
    }
}
exports.AuthRepository = AuthRepository;
