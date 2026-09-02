import { Request, Response, NextFunction } from 'express';
import { CrimeService } from './crime.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { broadcastEvent } from '../../shared/services/socket.service';

export class CrimeController {
  private crimeService: CrimeService;

  constructor() {
    this.crimeService = new CrimeService();
  }

  createReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const report = await this.crimeService.createReport(req.user!.id, req.body);
      
      // Real-time broadcast to police dashboards
      broadcastEvent('crime_reported', report);

      sendSuccess(res, 201, report, 'Crime Report submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  getReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const report = await this.crimeService.getReportById(req.params.id as string, req.user!.id, req.user!.role);
      sendSuccess(res, 200, report);
    } catch (error) {
      next(error);
    }
  };

  getAllReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const filters = {
        status: req.query.status as string,
        crime_type: req.query.crime_type as string
      };

      const result = await this.crimeService.getAllReports(req.user!.id, req.user!.role, page, limit, filters);
      sendSuccess(res, 200, result);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.crimeService.updateReportStatus(req.params.id as string, req.body.status);
      
      // Real-time broadcast
      broadcastEvent('crime_updated', report);

      sendSuccess(res, 200, report, 'Crime Report status updated successfully');
    } catch (error) {
      next(error);
    }
  };

  getMapReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const reports = await this.crimeService.getPublicMapReports(limit);
      sendSuccess(res, 200, reports);
    } catch (error) {
      next(error);
    }
  };
}

