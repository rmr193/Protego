"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ai_service_1 = require("./ai.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./ai.repository');
describe('AIService', () => {
    let aiService;
    let mockAIRepo;
    beforeEach(() => {
        mockAIRepo = {
            saveAnalysis: jest.fn(),
            getAnalysisByReportId: jest.fn()
        };
        aiService = new ai_service_1.AIService();
        aiService.aiRepository = mockAIRepo;
    });
    describe('analyzeReport', () => {
        it('should process and save AI analysis', async () => {
            mockAIRepo.saveAnalysis.mockResolvedValue({ analysis_id: '1', severity_score: 8 });
            const result = await aiService.analyzeReport('report1', 'Some bad incident');
            expect(mockAIRepo.saveAnalysis).toHaveBeenCalled();
            expect(result.analysis_id).toBe('1');
        });
    });
    describe('getAnalysis', () => {
        it('should return analysis if found', async () => {
            mockAIRepo.getAnalysisByReportId.mockResolvedValue({ analysis_id: '1' });
            const result = await aiService.getAnalysis('report1');
            expect(result.analysis_id).toBe('1');
        });
        it('should throw AppError if not found', async () => {
            mockAIRepo.getAnalysisByReportId.mockResolvedValue(null);
            await expect(aiService.getAnalysis('invalid')).rejects.toThrow(AppError_1.AppError);
        });
    });
});
