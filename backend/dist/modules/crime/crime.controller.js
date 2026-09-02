"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeController = void 0;
const crime_service_1 = require("./crime.service");
const response_1 = require("../../shared/utils/response");
const socket_service_1 = require("../../shared/services/socket.service");
class CrimeController {
    crimeService;
    constructor() {
        this.crimeService = new crime_service_1.CrimeService();
    }
    createReport = async (req, res, next) => {
        try {
            const report = await this.crimeService.createReport(req.user.id, req.body);
            // Real-time broadcast to police dashboards
            (0, socket_service_1.broadcastEvent)('crime_reported', report);
            (0, response_1.sendSuccess)(res, 201, report, 'Crime Report submitted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getReport = async (req, res, next) => {
        try {
            const report = await this.crimeService.getReportById(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, report);
        }
        catch (error) {
            next(error);
        }
    };
    getAllReports = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const filters = {
                status: req.query.status,
                crime_type: req.query.crime_type
            };
            const result = await this.crimeService.getAllReports(req.user.id, req.user.role, page, limit, filters);
            (0, response_1.sendSuccess)(res, 200, result);
        }
        catch (error) {
            next(error);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const report = await this.crimeService.updateReportStatus(req.params.id, req.body.status);
            // Real-time broadcast
            (0, socket_service_1.broadcastEvent)('crime_updated', report);
            (0, response_1.sendSuccess)(res, 200, report, 'Crime Report status updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CrimeController = CrimeController;
