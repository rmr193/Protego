"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sos_service_1 = require("./sos.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./sos.repository');
describe('SOSService', () => {
    let sosService;
    let mockSOSRepo;
    beforeEach(() => {
        mockSOSRepo = {
            triggerAlert: jest.fn(),
            findAlertById: jest.fn(),
            updateAlertStatus: jest.fn(),
            findActiveAlerts: jest.fn()
        };
        sosService = new sos_service_1.SOSService();
        sosService.sosRepository = mockSOSRepo;
    });
    describe('triggerAlert', () => {
        it('should trigger an active alert', async () => {
            mockSOSRepo.triggerAlert.mockResolvedValue({ sos_id: '1', status: 'ACTIVE' });
            const result = await sosService.triggerAlert('user1', { live_location: '23.8103,90.4125', emergency_type: 'MEDICAL' });
            expect(mockSOSRepo.triggerAlert).toHaveBeenCalled();
            expect(result.status).toBe('ACTIVE');
        });
    });
    describe('resolveAlert', () => {
        it('should throw AppError if alert not found', async () => {
            mockSOSRepo.findAlertById.mockResolvedValue(null);
            await expect(sosService.resolveAlert('invalid_id')).rejects.toThrow(AppError_1.AppError);
        });
        it('should update status to RESOLVED', async () => {
            mockSOSRepo.findAlertById.mockResolvedValue({ sos_id: '1' });
            mockSOSRepo.updateAlertStatus.mockResolvedValue({ sos_id: '1', status: 'RESOLVED' });
            const result = await sosService.resolveAlert('1');
            expect(result.status).toBe('RESOLVED');
        });
    });
});
