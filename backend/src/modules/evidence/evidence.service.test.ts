import { EvidenceService } from './evidence.service';
import { EvidenceRepository } from './evidence.repository';
import { AppError } from '../../shared/utils/AppError';
import fs from 'fs';

jest.mock('./evidence.repository');
jest.mock('fs');

describe('EvidenceService', () => {
  let evidenceService: EvidenceService;
  let mockEvidenceRepo: jest.Mocked<EvidenceRepository>;

  beforeEach(() => {
    mockEvidenceRepo = {
      findCrimeReportOwner: jest.fn(),
      uploadEvidence: jest.fn(),
      getEvidenceByReportId: jest.fn()
    } as any;
    evidenceService = new EvidenceService();
    (evidenceService as any).evidenceRepository = mockEvidenceRepo;
  });

  describe('uploadEvidence', () => {
    it('should throw AppError if report not found', async () => {
      mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue(null);
      const file: any = { filename: 'test.jpg', mimetype: 'image/jpeg' };

      await expect(evidenceService.uploadEvidence('user1', 'CITIZEN', 'invalid_report', file)).rejects.toThrow(AppError);
    });

    it('should upload evidence if user owns report', async () => {
      mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue({ user_id: 'user1' } as any);
      mockEvidenceRepo.uploadEvidence.mockResolvedValue({ evidence_id: '1' } as any);
      
      const file: any = { filename: 'test.jpg', mimetype: 'image/jpeg' };
      const result = await evidenceService.uploadEvidence('user1', 'CITIZEN', 'r1', file);
      
      expect(result.evidence_id).toBe('1');
    });

    it('should throw AppError if user does not own report', async () => {
      mockEvidenceRepo.findCrimeReportOwner.mockResolvedValue({ user_id: 'other' } as any);
      const file: any = { filename: 'test.jpg', mimetype: 'image/jpeg' };

      await expect(evidenceService.uploadEvidence('user1', 'CITIZEN', 'r1', file)).rejects.toThrow(AppError);
    });
  });
});
