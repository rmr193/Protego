import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';

jest.mock('./notification.repository');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockNotificationRepo: jest.Mocked<NotificationRepository>;

  beforeEach(() => {
    mockNotificationRepo = {
      createNotification: jest.fn(),
      markAsRead: jest.fn(),
      getUserNotifications: jest.fn()
    } as any;
    notificationService = new NotificationService();
    (notificationService as any).notificationRepository = mockNotificationRepo;
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      mockNotificationRepo.createNotification.mockResolvedValue({ notification_id: '1', status: 'UNREAD' } as any);

      const result = await notificationService.createNotification('user1', 'Test msg', 'SYSTEM');
      
      expect(mockNotificationRepo.createNotification).toHaveBeenCalled();
      expect(result.status).toBe('UNREAD');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      mockNotificationRepo.markAsRead.mockResolvedValue({ notification_id: '1', status: 'READ' } as any);

      const result = await notificationService.markAsRead('1', 'user1');
      expect(result.status).toBe('READ');
    });
  });
});
