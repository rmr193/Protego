import { CaseRepository } from './case.repository';
import { AppError } from '../../shared/utils/AppError';
import { NotificationService } from '../notification/notification.service';

export class CaseService {
  private caseRepository: CaseRepository;
  private notificationService: NotificationService;

  constructor() {
    this.caseRepository = new CaseRepository();
    this.notificationService = new NotificationService();
  }

  async createCase(data: { report_id: string; officer_id: string }) {
    const newCase = await this.caseRepository.createCase({
      report_id: data.report_id,
      officer_id: data.officer_id,
      case_status: 'OPEN'
    });

    try {
      if (newCase?.crime_report?.user_id) {
        const officerName = newCase.police_officer?.name || 'an assigned officer';
        await this.notificationService.createNotification(
          newCase.crime_report.user_id,
          `Officer ${officerName} has been assigned to investigate your crime report (Case #${newCase.case_id.slice(0, 8)}).`,
          'CASE_ASSIGNED'
        );
      }
    } catch (e) {
      // Non-blocking notification error handling
    }

    return newCase;
  }

  async getCaseById(caseId: string, userId: string, role: string) {
    const caseData = await this.caseRepository.findCaseById(caseId);
    if (!caseData) throw new AppError('Case not found', 404);

    // Citizen can only view the case if they own the underlying Crime Report
    if (role === 'CITIZEN' && caseData.crime_report.user_id !== userId) {
      throw new AppError('You do not have permission to view this case', 403);
    }

    return caseData;
  }

  async getAllCases(userId: string, role: string, filtersInput: any) {
    const filters: any = {};
    
    // If a police officer wants their own assigned cases:
    if (role === 'POLICE_OFFICER') {
      filters.officer_id = filtersInput.officer_id || undefined;
    }

    // Citizens cannot list all cases - they access via their reports. 
    return this.caseRepository.findAllCases(filters);
  }

  async addTrackingUpdate(caseId: string, statusUpdate: string, userId: string, role: string) {
    // Check if case exists
    const caseData = await this.caseRepository.findCaseById(caseId);
    if (!caseData) throw new AppError('Case not found', 404);

    // Ensure only the assigned officer can update
    if (role === 'CITIZEN') {
      throw new AppError('You do not have permission to update tracking', 403);
    }

    const tracking = await this.caseRepository.addTrackingUpdate({
      case_id: caseId,
      status_update: statusUpdate,
      updated_by: userId
    });

    // Optionally update the overall Case Status depending on the tracking keyword, e.g., 'CLOSED'
    if (statusUpdate.toLowerCase().includes('close')) {
      await this.caseRepository.updateCaseStatus(caseId, 'CLOSED');
    }

    try {
      if (caseData?.crime_report?.user_id) {
        await this.notificationService.createNotification(
          caseData.crime_report.user_id,
          `Investigation log updated on Case #${caseId.slice(0, 8)}: "${statusUpdate}"`,
          'CASE_UPDATE'
        );
      }
    } catch (e) {
      // Non-blocking notification error handling
    }

    return tracking;
  }
}
