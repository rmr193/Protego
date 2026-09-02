"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseService = void 0;
const case_repository_1 = require("./case.repository");
const AppError_1 = require("../../shared/utils/AppError");
const notification_service_1 = require("../notification/notification.service");
class CaseService {
    caseRepository;
    notificationService;
    constructor() {
        this.caseRepository = new case_repository_1.CaseRepository();
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createCase(data) {
        const newCase = await this.caseRepository.createCase({
            report_id: data.report_id,
            officer_id: data.officer_id,
            case_status: 'OPEN'
        });
        try {
            if (newCase?.crime_report?.user_id) {
                const officerName = newCase.police_officer?.name || 'an assigned officer';
                await this.notificationService.createNotification(newCase.crime_report.user_id, `Officer ${officerName} has been assigned to investigate your crime report (Case #${newCase.case_id.slice(0, 8)}).`, 'CASE_ASSIGNED');
            }
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return newCase;
    }
    async getCaseById(caseId, userId, role) {
        const caseData = await this.caseRepository.findCaseById(caseId);
        if (!caseData)
            throw new AppError_1.AppError('Case not found', 404);
        // Citizen can only view the case if they own the underlying Crime Report
        if (role === 'CITIZEN' && caseData.crime_report.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to view this case', 403);
        }
        return caseData;
    }
    async getAllCases(userId, role, filtersInput) {
        const filters = {};
        // If a police officer wants their own assigned cases:
        if (role === 'POLICE_OFFICER') {
            filters.officer_id = filtersInput.officer_id || undefined;
        }
        // Citizens cannot list all cases - they access via their reports. 
        return this.caseRepository.findAllCases(filters);
    }
    async addTrackingUpdate(caseId, statusUpdate, userId, role) {
        // Check if case exists
        const caseData = await this.caseRepository.findCaseById(caseId);
        if (!caseData)
            throw new AppError_1.AppError('Case not found', 404);
        // Ensure only the assigned officer can update
        if (role === 'CITIZEN') {
            throw new AppError_1.AppError('You do not have permission to update tracking', 403);
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
                await this.notificationService.createNotification(caseData.crime_report.user_id, `Investigation log updated on Case #${caseId.slice(0, 8)}: "${statusUpdate}"`, 'CASE_UPDATE');
            }
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return tracking;
    }
}
exports.CaseService = CaseService;
