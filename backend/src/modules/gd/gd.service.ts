import { GDRepository } from './gd.repository';
import { AppError } from '../../shared/utils/AppError';
import { NotificationService } from '../notification/notification.service';

export class GDService {
  private gdRepository: GDRepository;
  private notificationService: NotificationService;

  constructor() {
    this.gdRepository = new GDRepository();
    this.notificationService = new NotificationService();
  }

  async createGD(userId: string, data: any) {
    const gd = await this.gdRepository.createGD({
      ...data,
      user_id: userId,
      status: 'PENDING'
    });

    try {
      await this.notificationService.createNotification(
        userId,
        `Your General Diary "${gd.title}" has been successfully submitted and logged with police dispatch.`,
        'GD_SUBMITTED'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return gd;
  }

  async getGDById(gdId: string, userId: string, role: string) {
    const gd = await this.gdRepository.findGDById(gdId);
    if (!gd) throw new AppError('General Diary not found', 404);

    // Citizens can only view their own GDs
    if (role === 'CITIZEN' && gd.user_id !== userId) {
      throw new AppError('You do not have permission to view this GD', 403);
    }

    return gd;
  }

  async getAllGDs(userId: string, role: string, page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const filters: any = {};

    // Citizens only see their own GDs
    if (role === 'CITIZEN') {
      filters.user_id = userId;
    }

    if (status) {
      filters.status = status;
    }

    const { gds, total } = await this.gdRepository.findAllGDs(filters, skip, limit);
    return {
      gds,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateGDStatus(gdId: string, status: string) {
    // Check if exists
    const gd = await this.gdRepository.findGDById(gdId);
    if (!gd) throw new AppError('General Diary not found', 404);

    const updatedGD = await this.gdRepository.updateGD(gdId, { status });

    try {
      const isApproved = status === 'APPROVED';
      await this.notificationService.createNotification(
        gd.user_id,
        isApproved 
          ? `Your General Diary "${gd.title}" has been reviewed and APPROVED by central police station.` 
          : `Your General Diary "${gd.title}" status has been updated to ${status}.`,
        isApproved ? 'GD_APPROVED' : 'GD_UPDATED'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return updatedGD;
  }
}
