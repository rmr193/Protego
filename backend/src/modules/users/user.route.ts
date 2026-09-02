import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { updateProfileSchema } from './user.validation';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current logged in user profile
 * @access  Private
 */
router.get('/me', userController.getMe);

import { upload } from '../../shared/middlewares/upload.middleware';

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', upload.single('avatar'), validate(updateProfileSchema), userController.updateMe);

// ----------------------------------------------------
// Admin & Officer Routes
// ----------------------------------------------------

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Private (Police_Officer)
 */
router.get('/', restrictTo('POLICE_OFFICER'), userController.getAllUsers);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user
 * @access  Private (Police_Officer)
 */
router.delete('/:id', restrictTo('POLICE_OFFICER'), userController.deleteUser);

export default router;
