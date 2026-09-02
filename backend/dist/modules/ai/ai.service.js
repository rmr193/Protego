"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ai_repository_1 = require("./ai.repository");
const AppError_1 = require("../../shared/utils/AppError");
const logger_1 = require("../../shared/utils/logger");
// Ideally, this points to your Python ML service (e.g. http://localhost:5000)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
class AIService {
    aiRepository;
    constructor() {
        this.aiRepository = new ai_repository_1.AIRepository();
    }
    async analyzeReport(reportId, textDescription) {
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
        }
        catch (error) {
            logger_1.logger.error('Failed to communicate with ML Service', error);
            throw new AppError_1.AppError('AI Analysis failed', 500);
        }
    }
    async getAnalysis(reportId) {
        const analysis = await this.aiRepository.getAnalysisByReportId(reportId);
        if (!analysis) {
            throw new AppError_1.AppError('Analysis not found for this report', 404);
        }
        return analysis;
    }
}
exports.AIService = AIService;
