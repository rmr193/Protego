import { CrimeRepository } from './crime.repository';
import { AppError } from '../../shared/utils/AppError';
import { NotificationService } from '../notification/notification.service';

export class CrimeService {
  private crimeRepository: CrimeRepository;
  private notificationService: NotificationService;

  constructor() {
    this.crimeRepository = new CrimeRepository();
    this.notificationService = new NotificationService();
  }

  async createReport(userId: string, data: any) {
    const reportDate = data.date_time ? new Date(data.date_time) : new Date();
    const report = await this.crimeRepository.createReport({
      user_id: userId,
      crime_type: data.crime_type,
      description: data.description,
      location: data.location,
      status: 'PENDING',
      date_time: isNaN(reportDate.getTime()) ? new Date() : reportDate
    });

    try {
      await this.notificationService.createNotification(
        userId,
        `Your crime report for "${report.crime_type}" has been registered into the police investigation queue.`,
        'CRIME_SUBMITTED'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return report;
  }

  async getReportById(reportId: string, userId: string, role: string) {
    const report = await this.crimeRepository.findReportById(reportId);
    if (!report) throw new AppError('Crime Report not found', 404);

    if (role === 'CITIZEN' && report.user_id !== userId) {
      throw new AppError('You do not have permission to view this report', 403);
    }

    return report;
  }

  async getAllReports(userId: string, role: string, page: number = 1, limit: number = 10, filtersInput: any = {}) {
    const skip = (page - 1) * limit;
    const filters: any = {};

    if (role === 'CITIZEN') {
      filters.user_id = userId;
    }

    if (filtersInput.status) filters.status = filtersInput.status;
    if (filtersInput.crime_type) filters.crime_type = filtersInput.crime_type;

    const { reports, total } = await this.crimeRepository.findAllReports(filters, skip, limit);
    
    return {
      reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateReportStatus(reportId: string, status: string) {
    const report = await this.crimeRepository.findReportById(reportId);
    if (!report) throw new AppError('Crime Report not found', 404);

    const updated = await this.crimeRepository.updateReportStatus(reportId, status);

    try {
      const isResolved = status === 'RESOLVED';
      const isInvestigating = status === 'INVESTIGATING';
      await this.notificationService.createNotification(
        report.user_id,
        isResolved
          ? `Your crime report for "${report.crime_type}" has been marked RESOLVED by investigating officers.`
          : isInvestigating
          ? `An investigation has commenced for your crime report "${report.crime_type}".`
          : `Your crime report for "${report.crime_type}" status has been updated to ${status}.`,
        isResolved ? 'CRIME_RESOLVED' : 'CRIME_UPDATED'
      );
    } catch (e) {
      // Non-blocking notification error handling
    }

    return updated;
  }

  async getPublicMapReports(limit: number = 100) {
    return this.crimeRepository.findMapReports(limit);
  }
}
