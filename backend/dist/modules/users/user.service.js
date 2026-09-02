"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const AppError_1 = require("../../shared/utils/AppError");
class UserService {
    userRepository;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError_1.AppError('User not found', 404);
        }
        delete user.password;
        return user;
    }
    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const { users, total } = await this.userRepository.findAll(skip, limit);
        // Remove passwords
        const sanitizedUsers = users.map((user) => {
            delete user.password;
            return user;
        });
        return {
            users: sanitizedUsers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async updateProfile(userId, data) {
        // Ensure sensitive fields cannot be updated directly
        delete data.password;
        delete data.role_id;
        delete data.email; // Email changes might require verification logic
        const user = await this.userRepository.update(userId, data);
        delete user.password;
        return user;
    }
    async deleteUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new AppError_1.AppError('User not found', 404);
        }
        await this.userRepository.delete(userId);
    }
}
exports.UserService = UserService;
