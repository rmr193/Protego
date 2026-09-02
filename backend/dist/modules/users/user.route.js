"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
const userController = new user_controller_1.UserController();
// All user routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/v1/users/me
 * @desc    Get current logged in user profile
 * @access  Private
 */
router.get('/me', userController.getMe);
const upload_middleware_1 = require("../../shared/middlewares/upload.middleware");
/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', upload_middleware_1.upload.single('avatar'), (0, validate_middleware_1.validate)(user_validation_1.updateProfileSchema), userController.updateMe);
// ----------------------------------------------------
// Admin & Officer Routes
// ----------------------------------------------------
/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Private (Police_Officer)
 */
router.get('/', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), userController.getAllUsers);
/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Private (Police_Officer)
 */
router.delete('/:id', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), userController.deleteUser);
exports.default = router;
