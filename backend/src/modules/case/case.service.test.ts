import { CaseService } from './case.service';
import { CaseRepository } from './case.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./case.repository');

describe('CaseService', () => {
  let caseService: CaseService;
  let mockCaseRepo: jest.Mocked<CaseRepository>;

  beforeEach(() => {
    mockCaseRepo = {
      createCase: jest.fn(),
      findCaseById: jest.fn(),
      findAllCases: jest.fn(),
      updateCase: jest.fn()
    } as any;
    caseService = new CaseService();
    (caseService as any).caseRepository = mockCaseRepo;
  });

  describe('createCase', () => {
    it('should create a new case', async () => {
      mockCaseRepo.createCase.mockResolvedValue({ case_id: 'c1', case_status: 'OPEN' } as any);

      const result = await caseService.createCase({ report_id: 'r1', officer_id: 'o1' });
      expect(result.case_status).toBe('OPEN');
    });
  });

  describe('getCaseById', () => {
    it('should allow citizen to view their own case', async () => {
      const mockCase = { case_id: 'c1', crime_report: { user_id: 'user1' } };
      mockCaseRepo.findCaseById.mockResolvedValue(mockCase as any);

      const result = await caseService.getCaseById('c1', 'user1', 'CITIZEN');
      expect(result.case_id).toBe('c1');
    });

    it('should throw AppError if citizen views someone elses case', async () => {
      const mockCase = { case_id: 'c1', crime_report: { user_id: 'other' } };
      mockCaseRepo.findCaseById.mockResolvedValue(mockCase as any);

      await expect(caseService.getCaseById('c1', 'user1', 'CITIZEN')).rejects.toThrow(AppError);
    });
  });
});
