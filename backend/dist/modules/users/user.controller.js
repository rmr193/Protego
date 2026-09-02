"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const response_1 = require("../../shared/utils/response");
class UserController {
    userService;
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    getMe = async (req, res, next) => {
        try {
            const user = await this.userService.getProfile(req.user.id);
            (0, response_1.sendSuccess)(res, 200, user, 'Profile retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    updateMe = async (req, res, next) => {
        try {
            const data = { ...req.body };
            if (req.file) {
                data.avatar_url = `/uploads/${req.file.filename}`;
            }
            const user = await this.userService.updateProfile(req.user.id, data);
            (0, response_1.sendSuccess)(res, 200, user, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAllUsers = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await this.userService.getAllUsers(page, limit);
            (0, response_1.sendSuccess)(res, 200, result, 'Users retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteUser = async (req, res, next) => {
        try {
            await this.userService.deleteUser(req.params.id);
            (0, response_1.sendSuccess)(res, 200, null, 'User deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.UserController = UserController;
