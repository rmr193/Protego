import { Request, Response, NextFunction } from 'express';
import { GDService } from './gd.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { broadcastEvent } from '../../shared/services/socket.service';

export class GDController {
  private gdService: GDService;

  constructor() {
    this.gdService = new GDService();
  }

  createGD = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const gd = await this.gdService.createGD(req.user!.id, req.body);
      
      // Real-time broadcast
      broadcastEvent('gd_filed', gd);

      sendSuccess(res, 201, gd, 'General Diary submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  getGD = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const gd = await this.gdService.getGDById(req.params.id as string, req.user!.id, req.user!.role);
      sendSuccess(res, 200, gd);
    } catch (error) {
      next(error);
    }
  };

  getAllGDs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;

      const result = await this.gdService.getAllGDs(req.user!.id, req.user!.role, page, limit, status);
      sendSuccess(res, 200, result);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const gd = await this.gdService.updateGDStatus(req.params.id as string, req.body.status);
      
      // Real-time broadcast
      broadcastEvent('gd_updated', gd);

      sendSuccess(res, 200, gd, 'GD status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getMapGDs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const gds = await this.gdService.getPublicMapGDs(limit);
      sendSuccess(res, 200, gds);
    } catch (error) {
      next(error);
    }
  };
}

