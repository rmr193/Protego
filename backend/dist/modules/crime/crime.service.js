"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeService = void 0;
const crime_repository_1 = require("./crime.repository");
const AppError_1 = require("../../shared/utils/AppError");
const notification_service_1 = require("../notification/notification.service");
class CrimeService {
    crimeRepository;
    notificationService;
    constructor() {
        this.crimeRepository = new crime_repository_1.CrimeRepository();
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createReport(userId, data) {
        const report = await this.crimeRepository.createReport({
            ...data,
            user_id: userId,
            status: 'PENDING',
            date_time: new Date(data.date_time)
        });
        try {
            await this.notificationService.createNotification(userId, `Your crime report for "${report.crime_type}" has been registered into the police investigation queue.`, 'CRIME_SUBMITTED');
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return report;
    }
    async getReportById(reportId, userId, role) {
        const report = await this.crimeRepository.findReportById(reportId);
        if (!report)
            throw new AppError_1.AppError('Crime Report not found', 404);
        if (role === 'CITIZEN' && report.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to view this report', 403);
        }
        return report;
    }
    async getAllReports(userId, role, page = 1, limit = 10, filtersInput = {}) {
        const skip = (page - 1) * limit;
        const filters = {};
        if (role === 'CITIZEN') {
            filters.user_id = userId;
        }
        if (filtersInput.status)
            filters.status = filtersInput.status;
        if (filtersInput.crime_type)
            filters.crime_type = filtersInput.crime_type;
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
    async updateReportStatus(reportId, status) {
        const report = await this.crimeRepository.findReportById(reportId);
        if (!report)
            throw new AppError_1.AppError('Crime Report not found', 404);
        const updated = await this.crimeRepository.updateReportStatus(reportId, status);
        try {
            const isResolved = status === 'RESOLVED';
            const isInvestigating = status === 'INVESTIGATING';
            await this.notificationService.createNotification(report.user_id, isResolved
                ? `Your crime report for "${report.crime_type}" has been marked RESOLVED by investigating officers.`
                : isInvestigating
                    ? `An investigation has commenced for your crime report "${report.crime_type}".`
                    : `Your crime report for "${report.crime_type}" status has been updated to ${status}.`, isResolved ? 'CRIME_RESOLVED' : 'CRIME_UPDATED');
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return updated;
    }
}
exports.CrimeService = CrimeService;
