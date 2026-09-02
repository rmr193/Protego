"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceController = void 0;
const evidence_service_1 = require("./evidence.service");
const response_1 = require("../../shared/utils/response");
const AppError_1 = require("../../shared/utils/AppError");
class EvidenceController {
    evidenceService;
    constructor() {
        this.evidenceService = new evidence_service_1.EvidenceService();
    }
    uploadEvidence = async (req, res, next) => {
        try {
            if (!req.file) {
                throw new AppError_1.AppError('No file uploaded', 400);
            }
            const reportId = req.params.reportId;
            const evidence = await this.evidenceService.uploadEvidence(req.user.id, req.user.role, reportId, req.file);
            (0, response_1.sendSuccess)(res, 201, evidence, 'Evidence uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getEvidenceByReport = async (req, res, next) => {
        try {
            const reportId = req.params.reportId;
            const evidenceList = await this.evidenceService.getEvidenceByReportId(reportId, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, evidenceList);
        }
        catch (error) {
            next(error);
        }
    };
    deleteEvidence = async (req, res, next) => {
        try {
            await this.evidenceService.deleteEvidence(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, null, 'Evidence deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.EvidenceController = EvidenceController;
