import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      sendSuccess(res, 201, { user: result.user, accessToken: result.accessToken }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      sendSuccess(res, 200, { user: result.user, accessToken: result.accessToken }, 'Login successful');
    } catch (error) {
      console.error('💥 LOGIN ERROR DETAILS:', error);
      next(error);
    }
  };

  refreshTokens = async (req: Request, res: Response, next: NextFunction) => {
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

      sendSuccess(res, 200, { accessToken: result.accessToken }, 'Tokens refreshed');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      await this.authService.logout(token);

      res.clearCookie('refreshToken');
      sendSuccess(res, 200, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };
}
