"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evidence_service_1 = require("./evidence.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./evidence.repository');
jest.mock('fs');
describe('EvidenceService', () => {
    let evidenceService;
    let mockEvidenceRepo;
    beforeEach(() => {
        mockEvidenceRepo = {
            findCrimeReportOwner: jest.fn(),
            uploadEvidence: jest.fn(),
            getEvidenceByReportId: jest.fn()
        };
        evidenceService = new evidence_service_1.EvidenceService();
        evidenceService.evidenceRepository = mockEvidenceRepo;
    });
    describe('uploadEvidence', () => {
        it('should throw AppError if report not found', async () => {
            mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue(null);
            const file = { filename: 'test.jpg', mimetype: 'image/jpeg' };
            await expect(evidenceService.uploadEvidence('user1', 'CITIZEN', 'invalid_report', file)).rejects.toThrow(AppError_1.AppError);
        });
        it('should upload evidence if user owns report', async () => {
            mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue({ user_id: 'user1' });
            mockEvidenceRepo.uploadEvidence.mockResolvedValue({ evidence_id: '1' });
            const file = { filename: 'test.jpg', mimetype: 'image/jpeg' };
            const result = await evidenceService.uploadEvidence('user1', 'CITIZEN', 'r1', file);
            expect(result.evidence_id).toBe('1');
        });
        it('should throw AppError if user does not own report', async () => {
            mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue({ user_id: 'other' });
            const file = { filename: 'test.jpg', mimetype: 'image/jpeg' };
            await expect(evidenceService.uploadEvidence('user1', 'CITIZEN', 'r1', file)).rejects.toThrow(AppError_1.AppError);
        });
    });
});
