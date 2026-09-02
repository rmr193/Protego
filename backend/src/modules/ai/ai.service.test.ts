import { AIService } from './ai.service';
import { AIRepository } from './ai.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./ai.repository');

describe('AIService', () => {
  let aiService: AIService;
  let mockAIRepo: jest.Mocked<AIRepository>;

  beforeEach(() => {
    mockAIRepo = {
      saveAnalysis: jest.fn(),
      getAnalysisByReportId: jest.fn()
    } as any;
    aiService = new AIService();
    (aiService as any).aiRepository = mockAIRepo;
  });

  describe('analyzeReport', () => {
    it('should process and save AI analysis', async () => {
      mockAIRepo.saveAnalysis.mockResolvedValue({ analysis_id: '1', severity_score: 8 } as any);

      const result = await aiService.analyzeReport('report1', 'Some bad incident');
      
      expect(mockAIRepo.saveAnalysis).toHaveBeenCalled();
      expect(result.analysis_id).toBe('1');
    });
  });

  describe('getAnalysis', () => {
    it('should return analysis if found', async () => {
      mockAIRepo.getAnalysisByReportId.mockResolvedValue({ analysis_id: '1' } as any);

      const result = await aiService.getAnalysis('report1');
      expect(result.analysis_id).toBe('1');
    });

    it('should throw AppError if not found', async () => {
      mockAIRepo.getAnalysisByReportId.mockResolvedValue(null);
      await expect(aiService.getAnalysis('invalid')).rejects.toThrow(AppError);
    });
  });
});
