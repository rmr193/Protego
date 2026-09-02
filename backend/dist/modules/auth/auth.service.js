"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_repository_1 = require("./auth.repository");
const AppError_1 = require("../../shared/utils/AppError");
const env_1 = require("../../config/env");
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    signTokens(user) {
        const accessToken = jsonwebtoken_1.default.sign({ id: user.user_id, role: user.role.name }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.user_id }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN });
        return { accessToken, refreshToken };
    }
    async register(data) {
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError_1.AppError('Email already in use', 400);
        }
        const defaultRole = await this.authRepository.findRoleByName('CITIZEN');
        if (!defaultRole) {
            throw new AppError_1.AppError('Default role not found. Please seed the database.', 500);
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        const newUser = await this.authRepository.createUser({
            ...data,
            password: hashedPassword,
            role_id: defaultRole.role_id
        });
        const tokens = this.signTokens(newUser);
        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await this.authRepository.createRefreshToken(newUser.user_id, tokens.refreshToken, expiresAt);
        // Remove password from response
        delete newUser.password;
        return { user: newUser, ...tokens };
    }
    async login(data) {
        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user || !(await bcrypt_1.default.compare(data.password, user.password))) {
            throw new AppError_1.AppError('Incorrect email or password', 401);
        }
        const tokens = this.signTokens(user);
        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.authRepository.createRefreshToken(user.user_id, tokens.refreshToken, expiresAt);
        delete user.password;
        return { user, ...tokens };
    }
    async refreshTokens(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
            const savedToken = await this.authRepository.findRefreshToken(token);
            if (!savedToken || savedToken.user_id !== decoded.id) {
                throw new AppError_1.AppError('Invalid refresh token', 401);
            }
            const tokens = this.signTokens(savedToken.user);
            // Rotate tokens
            await this.authRepository.deleteRefreshToken(token);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await this.authRepository.createRefreshToken(savedToken.user_id, tokens.refreshToken, expiresAt);
            return tokens;
        }
        catch (error) {
            throw new AppError_1.AppError('Invalid or expired refresh token', 401);
        }
    }
    async logout(token) {
        if (!token)
            return;
        await this.authRepository.deleteRefreshToken(token);
    }
}
exports.AuthService = AuthService;
