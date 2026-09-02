"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceService = void 0;
const evidence_repository_1 = require("./evidence.repository");
const AppError_1 = require("../../shared/utils/AppError");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EvidenceService {
    evidenceRepository;
    constructor() {
        this.evidenceRepository = new evidence_repository_1.EvidenceRepository();
    }
    async uploadEvidence(userId, role, reportId, file) {
        const reportOwner = await this.evidenceRepository.findCrimeReportOwner(reportId);
        if (!reportOwner) {
            throw new AppError_1.AppError('Crime Report not found', 404);
        }
        // Only the creator or Admin/Police can upload evidence
        if (role === 'CITIZEN' && reportOwner.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to upload evidence for this report', 403);
        }
        const fileUrl = `/uploads/${file.filename}`;
        return this.evidenceRepository.uploadEvidence({
            report_id: reportId,
            file_type: file.mimetype,
            file_url: fileUrl
        });
    }
    async getEvidenceByReportId(reportId, userId, role) {
        const reportOwner = await this.evidenceRepository.findCrimeReportOwner(reportId);
        if (!reportOwner)
            throw new AppError_1.AppError('Crime Report not found', 404);
        if (role === 'CITIZEN' && reportOwner.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to view evidence for this report', 403);
        }
        return this.evidenceRepository.getEvidenceByReportId(reportId);
    }
    async deleteEvidence(evidenceId, userId, role) {
        const evidence = await this.evidenceRepository.getEvidenceById(evidenceId);
        if (!evidence)
            throw new AppError_1.AppError('Evidence not found', 404);
        if (role === 'CITIZEN' && evidence.crime_report.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to delete this evidence', 403);
        }
        // Remove file from disk
        const filePath = path_1.default.join(__dirname, '../../../', evidence.file_url);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await this.evidenceRepository.deleteEvidence(evidenceId);
    }
}
exports.EvidenceService = EvidenceService;
