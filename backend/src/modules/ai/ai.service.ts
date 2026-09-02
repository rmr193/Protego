import { AIRepository } from './ai.repository';
import { AppError } from '../../shared/utils/AppError';
import { logger } from '../../shared/utils/logger';

// Ideally, this points to your Python ML service (e.g. http://localhost:5000)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

export class AIService {
  private aiRepository: AIRepository;

  constructor() {
    this.aiRepository = new AIRepository();
  }

  async analyzeReport(reportId: string, textDescription: string) {
    try {
      // In a real scenario, we call the Python ML Service
      // const response = await fetch(`${ML_SERVICE_URL}/analyze`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: textDescription })
      // });
      // const data = await response.json();

      // MOCK RESPONSE for now until ML service is integrated
      const data = {
        fake_probability: Math.random(),
        severity_score: Math.floor(Math.random() * 10) + 1,
        category: 'Inferred Category'
      };

      const is_fake = data.fake_probability > 0.7;

      const analysis = await this.aiRepository.saveAnalysis({
        report_id: reportId,
        fake_probability: data.fake_probability,
        is_fake,
        severity_score: data.severity_score,
        category: data.category
      });

      return analysis;
    } catch (error) {
      logger.error('Failed to communicate with ML Service', error);
      throw new AppError('AI Analysis failed', 500);
    }
  }

  async getAnalysis(reportId: string) {
    const analysis = await this.aiRepository.getAnalysisByReportId(reportId);
    if (!analysis) {
      throw new AppError('Analysis not found for this report', 404);
    }
    return analysis;
  }
}
