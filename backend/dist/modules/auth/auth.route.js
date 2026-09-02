"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const auth_validation_1 = require("./auth.validation");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new citizen
 * @access  Public
 */
router.post('/register', (0, validate_middleware_1.validate)(auth_validation_1.registerSchema), authController.register);
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (0, validate_middleware_1.validate)(auth_validation_1.loginSchema), authController.login);
/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (Requires valid refresh token in body or cookie)
 */
router.post('/refresh', authController.refreshTokens);
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
exports.default = router;
