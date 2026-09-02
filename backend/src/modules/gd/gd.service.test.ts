import { GDService } from './gd.service';
import { GDRepository } from './gd.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./gd.repository');

describe('GDService', () => {
  let gdService: GDService;
  let mockGDRepo: jest.Mocked<GDRepository>;

  beforeEach(() => {
    mockGDRepo = {
      createGD: jest.fn(),
      findGDById: jest.fn(),
      findAllGDs: jest.fn(),
      updateGD: jest.fn()
    } as any;
    gdService = new GDService();
    (gdService as any).gdRepository = mockGDRepo;
  });

  describe('createGD', () => {
    it('should create a GD with PENDING status', async () => {
      const mockGD = { gd_id: 'gd1', title: 'Stolen Phone', status: 'PENDING' };
      mockGDRepo.createGD.mockResolvedValue(mockGD as any);

      const result = await gdService.createGD('user1', { title: 'Stolen Phone', description: 'Lost at park' });
      
      expect(mockGDRepo.createGD).toHaveBeenCalledWith({
        user_id: 'user1',
        title: 'Stolen Phone',
        description: 'Lost at park',
        status: 'PENDING'
      });
      expect(result.status).toBe('PENDING');
    });
  });

  describe('getGDById', () => {
    it('should allow citizen to view their own GD', async () => {
      const mockGD = { gd_id: '1', user_id: 'user1' };
      mockGDRepo.findGDById.mockResolvedValue(mockGD as any);

      const gd = await gdService.getGDById('1', 'user1', 'CITIZEN');
      expect(gd.user_id).toBe('user1');
    });

    it('should throw AppError if citizen views someone else GD', async () => {
      const mockGD = { gd_id: '1', user_id: 'other_user' };
      mockGDRepo.findGDById.mockResolvedValue(mockGD as any);

      await expect(gdService.getGDById('1', 'user1', 'CITIZEN')).rejects.toThrow(AppError);
    });

    it('should allow Police to view any GD', async () => {
      const mockGD = { gd_id: '1', user_id: 'other_user' };
      mockGDRepo.findGDById.mockResolvedValue(mockGD as any);

      const gd = await gdService.getGDById('1', 'police_user', 'POLICE_OFFICER');
      expect(gd.user_id).toBe('other_user');
    });
  });
});
