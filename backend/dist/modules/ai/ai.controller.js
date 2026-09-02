"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("./ai.service");
const response_1 = require("../../shared/utils/response");
class AIController {
    aiService;
    constructor() {
        this.aiService = new ai_service_1.AIService();
    }
    analyzeReport = async (req, res, next) => {
        try {
            const { report_id, description } = req.body;
            const analysis = await this.aiService.analyzeReport(report_id, description);
            (0, response_1.sendSuccess)(res, 201, analysis, 'Report analyzed by AI successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAnalysis = async (req, res, next) => {
        try {
            const analysis = await this.aiService.getAnalysis(req.params.reportId);
            (0, response_1.sendSuccess)(res, 200, analysis);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AIController = AIController;
