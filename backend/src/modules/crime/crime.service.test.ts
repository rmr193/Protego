import { CrimeService } from './crime.service';
import { CrimeRepository } from './crime.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./crime.repository');

describe('CrimeService', () => {
  let crimeService: CrimeService;
  let mockCrimeRepo: jest.Mocked<CrimeRepository>;

  beforeEach(() => {
    mockCrimeRepo = {
      createReport: jest.fn(),
      findReportById: jest.fn(),
      findAllReports: jest.fn(),
      updateReportStatus: jest.fn()
    } as any;
    crimeService = new CrimeService();
    (crimeService as any).crimeRepository = mockCrimeRepo;
  });

  describe('createReport', () => {
    it('should create a Crime Report with PENDING status', async () => {
      const mockReport = { report_id: 'r1', crime_type: 'Theft', status: 'PENDING' };
      mockCrimeRepo.createReport.mockResolvedValue(mockReport as any);

      const result = await crimeService.createReport('user1', { 
        crime_type: 'Theft', 
        description: 'Stolen laptop',
        location: 'Dhaka',
        date_time: '2023-01-01T12:00:00Z'
      });
      
      expect(mockCrimeRepo.createReport).toHaveBeenCalled();
      expect(result.status).toBe('PENDING');
    });
  });

  describe('getReportById', () => {
    it('should allow citizen to view their own report', async () => {
      const mockReport = { report_id: '1', user_id: 'user1' };
      mockCrimeRepo.findReportById.mockResolvedValue(mockReport as any);

      const report = await crimeService.getReportById('1', 'user1', 'CITIZEN');
      expect(report.user_id).toBe('user1');
    });

    it('should throw AppError if citizen views someone else report', async () => {
      const mockReport = { report_id: '1', user_id: 'other_user' };
      mockCrimeRepo.findReportById.mockResolvedValue(mockReport as any);

      await expect(crimeService.getReportById('1', 'user1', 'CITIZEN')).rejects.toThrow(AppError);
    });
  });
});
