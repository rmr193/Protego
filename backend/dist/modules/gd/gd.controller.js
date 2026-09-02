"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDController = void 0;
const gd_service_1 = require("./gd.service");
const response_1 = require("../../shared/utils/response");
const socket_service_1 = require("../../shared/services/socket.service");
class GDController {
    gdService;
    constructor() {
        this.gdService = new gd_service_1.GDService();
    }
    createGD = async (req, res, next) => {
        try {
            const gd = await this.gdService.createGD(req.user.id, req.body);
            // Real-time broadcast
            (0, socket_service_1.broadcastEvent)('gd_filed', gd);
            (0, response_1.sendSuccess)(res, 201, gd, 'General Diary submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getGD = async (req, res, next) => {
        try {
            const gd = await this.gdService.getGDById(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, gd);
        }
        catch (error) {
            next(error);
        }
    };
    getAllGDs = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const status = req.query.status;
            const result = await this.gdService.getAllGDs(req.user.id, req.user.role, page, limit, status);
            (0, response_1.sendSuccess)(res, 200, result);
        }
        catch (error) {
            next(error);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const gd = await this.gdService.updateGDStatus(req.params.id, req.body.status);
            // Real-time broadcast
            (0, socket_service_1.broadcastEvent)('gd_updated', gd);
            (0, response_1.sendSuccess)(res, 200, gd, 'GD status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.GDController = GDController;
