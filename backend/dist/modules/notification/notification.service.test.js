"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = require("./notification.service");
jest.mock('./notification.repository');
describe('NotificationService', () => {
    let notificationService;
    let mockNotificationRepo;
    beforeEach(() => {
        mockNotificationRepo = {
            createNotification: jest.fn(),
            markAsRead: jest.fn(),
            getUserNotifications: jest.fn()
        };
        notificationService = new notification_service_1.NotificationService();
        notificationService.notificationRepository = mockNotificationRepo;
    });
    describe('createNotification', () => {
        it('should create a notification', async () => {
            mockNotificationRepo.createNotification.mockResolvedValue({ notification_id: '1', status: 'UNREAD' });
            const result = await notificationService.createNotification('user1', 'Test msg', 'SYSTEM');
            expect(mockNotificationRepo.createNotification).toHaveBeenCalled();
            expect(result.status).toBe('UNREAD');
        });
    });
    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            mockNotificationRepo.markAsRead.mockResolvedValue({ notification_id: '1', status: 'READ' });
            const result = await notificationService.markAsRead('1', 'user1');
            expect(result.status).toBe('READ');
        });
    });
});
