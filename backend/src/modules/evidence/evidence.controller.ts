import { Request, Response, NextFunction } from 'express';
import { EvidenceService } from './evidence.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { AppError } from '../../shared/utils/AppError';

export class EvidenceController {
  private evidenceService: EvidenceService;

  constructor() {
    this.evidenceService = new EvidenceService();
  }

  uploadEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }
      const reportId = req.params.reportId as string;
      const evidence = await this.evidenceService.uploadEvidence(req.user!.id, req.user!.role, reportId, req.file);
      sendSuccess(res, 201, evidence, 'Evidence uploaded successfully');
    } catch (error) {
      next(error);
    }
  };

  getEvidenceByReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const reportId = req.params.reportId as string;
      const evidenceList = await this.evidenceService.getEvidenceByReportId(reportId, req.user!.id, req.user!.role);
      sendSuccess(res, 200, evidenceList);
    } catch (error) {
      next(error);
    }
  };

  deleteEvidence = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.evidenceService.deleteEvidence(req.params.id as string, req.user!.id, req.user!.role);
      sendSuccess(res, 200, null, 'Evidence deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
