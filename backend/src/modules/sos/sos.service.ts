import { SOSRepository } from './sos.repository';
import { AppError } from '../../shared/utils/AppError';
import { NotificationService } from '../notification/notification.service';

export class SOSService {
  private sosRepository: SOSRepository;
  private notificationService: NotificationService;

  constructor() {
    this.sosRepository = new SOSRepository();
    this.notificationService = new NotificationService();
  }

  async triggerAlert(userId: string, data: any) {
    const alert = await this.sosRepository.triggerAlert({
      user_id: userId,
      live_location: data.live_location,
      emergency_type: data.emergency_type
    });

    try {
      await this.notificationService.createNotification(
        userId,
        `Emergency SOS broadcast activated at location: ${data.live_location || 'Live Coordinates'}. Nearest police units notified.`,
        'SOS_ACTIVE'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return alert;
  }

  async getAlertById(alertId: string, userId: string, role: string) {
    const alert = await this.sosRepository.findAlertById(alertId);
    if (!alert) throw new AppError('SOS Alert not found', 404);

    if (role === 'CITIZEN' && alert.user_id !== userId) {
      throw new AppError('You do not have permission to view this alert', 403);
    }

    return alert;
  }

  async getActiveAlerts() {
    // Only Police will access this, protected by middleware
    return this.sosRepository.getActiveAlerts();
  }

  async getUserActiveAlert(userId: string) {
    return this.sosRepository.findActiveAlertByUserId(userId);
  }

  async resolveAlert(alertId: string, userId?: string, role?: string) {
    const alert = await this.sosRepository.findAlertById(alertId);
    if (!alert) throw new AppError('SOS Alert not found', 404);

    if (role === 'CITIZEN' && userId && alert.user_id !== userId) {
      throw new AppError('You do not have permission to resolve this alert', 403);
    }

    const resolved = await this.sosRepository.updateAlertStatus(alertId, 'RESOLVED');

    try {
      await this.notificationService.createNotification(
        alert.user_id,
        'Your emergency SOS panic broadcast has been marked as RESOLVED by central police dispatch.',
        'SOS_RESOLVED'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return resolved;
  }
}
