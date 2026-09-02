import { Request, Response, NextFunction } from 'express';
import { CaseService } from './case.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

export class CaseController {
  private caseService: CaseService;

  constructor() {
    this.caseService = new CaseService();
  }

  createCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseData = await this.caseService.createCase(req.body);
      sendSuccess(res, 201, caseData, 'Case created and officer assigned successfully');
    } catch (error) {
      next(error);
    }
  };

  getCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const caseData = await this.caseService.getCaseById(req.params.id as string, req.user!.id, req.user!.role);
      sendSuccess(res, 200, caseData);
    } catch (error) {
      next(error);
    }
  };

  getAllCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Allow fetching assigned cases for officers
      const filters = {
        officer_id: req.query.officer_id as string
      };
      
      const cases = await this.caseService.getAllCases(req.user!.id, req.user!.role, filters);
      sendSuccess(res, 200, cases);
    } catch (error) {
      next(error);
    }
  };

  addTrackingUpdate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tracking = await this.caseService.addTrackingUpdate(
        req.params.id as string, 
        req.body.status_update, 
        req.user!.id, 
        req.user!.role
      );
      sendSuccess(res, 201, tracking, 'Tracking updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
