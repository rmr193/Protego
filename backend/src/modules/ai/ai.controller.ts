import { Request, Response, NextFunction } from 'express';
import { AIService } from './ai.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  analyzeReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { report_id, description } = req.body;
      const analysis = await this.aiService.analyzeReport(report_id, description);
      sendSuccess(res, 201, analysis, 'Report analyzed by AI successfully');
    } catch (error) {
      next(error);
    }
  };

  getAnalysis = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const analysis = await this.aiService.getAnalysis(req.params.reportId as string);
      sendSuccess(res, 200, analysis);
    } catch (error) {
      next(error);
    }
  };
}
