"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDService = void 0;
const gd_repository_1 = require("./gd.repository");
const AppError_1 = require("../../shared/utils/AppError");
const notification_service_1 = require("../notification/notification.service");
class GDService {
    gdRepository;
    notificationService;
    constructor() {
        this.gdRepository = new gd_repository_1.GDRepository();
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createGD(userId, data) {
        const gd = await this.gdRepository.createGD({
            ...data,
            user_id: userId,
            status: 'PENDING'
        });
        try {
            await this.notificationService.createNotification(userId, `Your General Diary "${gd.title}" has been successfully submitted and logged with police dispatch.`, 'GD_SUBMITTED');
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return gd;
    }
    async getGDById(gdId, userId, role) {
        const gd = await this.gdRepository.findGDById(gdId);
        if (!gd)
            throw new AppError_1.AppError('General Diary not found', 404);
        // Citizens can only view their own GDs
        if (role === 'CITIZEN' && gd.user_id !== userId) {
            throw new AppError_1.AppError('You do not have permission to view this GD', 403);
        }
        return gd;
    }
    async getAllGDs(userId, role, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const filters = {};
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
    async updateGDStatus(gdId, status) {
        // Check if exists
        const gd = await this.gdRepository.findGDById(gdId);
        if (!gd)
            throw new AppError_1.AppError('General Diary not found', 404);
        const updatedGD = await this.gdRepository.updateGD(gdId, { status });
        try {
            const isApproved = status === 'APPROVED';
            await this.notificationService.createNotification(gd.user_id, isApproved
                ? `Your General Diary "${gd.title}" has been reviewed and APPROVED by central police station.`
                : `Your General Diary "${gd.title}" status has been updated to ${status}.`, isApproved ? 'GD_APPROVED' : 'GD_UPDATED');
        }
        catch (e) {
            // Non-blocking notification error handling
        }
        return updatedGD;
    }
}
exports.GDService = GDService;
