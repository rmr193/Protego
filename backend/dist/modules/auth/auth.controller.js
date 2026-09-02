"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../shared/utils/response");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    register = async (req, res, next) => {
        try {
            const result = await this.authService.register(req.body);
            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            (0, response_1.sendSuccess)(res, 201, { user: result.user, accessToken: result.accessToken }, 'User registered successfully');
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const result = await this.authService.login(req.body);
            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            (0, response_1.sendSuccess)(res, 200, { user: result.user, accessToken: result.accessToken }, 'Login successful');
        }
        catch (error) {
            next(error);
        }
    };
    refreshTokens = async (req, res, next) => {
        try {
            // Allow token from body or cookie
            const token = req.body.refreshToken || req.cookies?.refreshToken;
            const result = await this.authService.refreshTokens(token);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            (0, response_1.sendSuccess)(res, 200, { accessToken: result.accessToken }, 'Tokens refreshed');
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const token = req.body.refreshToken || req.cookies?.refreshToken;
            await this.authService.logout(token);
            res.clearCookie('refreshToken');
            (0, response_1.sendSuccess)(res, 200, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
