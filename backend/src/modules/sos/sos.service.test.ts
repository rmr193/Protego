import { SOSService } from './sos.service';
import { SOSRepository } from './sos.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./sos.repository');
jest.mock('../notification/notification.service');

describe('SOSService', () => {
  let sosService: SOSService;
  let mockSOSRepo: jest.Mocked<SOSRepository>;

  beforeEach(() => {
    mockSOSRepo = {
      triggerAlert: jest.fn(),
      findAlertById: jest.fn(),
      updateAlertStatus: jest.fn(),
      findActiveAlerts: jest.fn()
    } as any;
    sosService = new SOSService();
    (sosService as any).sosRepository = mockSOSRepo;
    (sosService as any).notificationService = {
      createNotification: jest.fn().mockResolvedValue({})
    };
  });

  describe('triggerAlert', () => {
    it('should trigger an active alert', async () => {
      mockSOSRepo.triggerAlert.mockResolvedValue({ sos_id: '1', status: 'ACTIVE' } as any);

      const result = await sosService.triggerAlert('user1', { live_location: '23.8103,90.4125', emergency_type: 'MEDICAL' });
      
      expect(mockSOSRepo.triggerAlert).toHaveBeenCalled();
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('resolveAlert', () => {
    it('should throw AppError if alert not found', async () => {
      mockSOSRepo.findAlertById.mockResolvedValue(null);
      await expect(sosService.resolveAlert('invalid_id')).rejects.toThrow(AppError);
    });

    it('should update status to RESOLVED', async () => {
      mockSOSRepo.findAlertById.mockResolvedValue({ sos_id: '1' } as any);
      mockSOSRepo.updateAlertStatus.mockResolvedValue({ sos_id: '1', status: 'RESOLVED' } as any);

      const result = await sosService.resolveAlert('1');
      expect(result.status).toBe('RESOLVED');
    });
  });
});
