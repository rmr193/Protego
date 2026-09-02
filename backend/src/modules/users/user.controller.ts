import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from '../../shared/services/cloudinary.service';
import { logger } from '../../shared/utils/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getProfile(req.user!.id);
      sendSuccess(res, 200, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body };
      if (req.file) {
        if (req.file.buffer) {
          try {
            const uploadRes = await uploadToCloudinary(req.file.buffer, 'protego/avatars', 'image');
            data.avatar_url = uploadRes.secure_url;
          } catch (cloudErr) {
            logger.warn('Cloudinary upload failed, falling back to local storage:', cloudErr);
            const uploadDir = path.join(__dirname, '../../../../uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            const filename = `avatar-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
            data.avatar_url = `/uploads/${filename}`;
          }
        } else if (req.file.filename) {
          data.avatar_url = `/uploads/${req.file.filename}`;
        }
      }
      const user = await this.userService.updateProfile(req.user!.id, data);
      sendSuccess(res, 200, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.userService.getAllUsers(page, limit);
      sendSuccess(res, 200, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.deleteUser(req.params.id as string);
      sendSuccess(res, 200, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
