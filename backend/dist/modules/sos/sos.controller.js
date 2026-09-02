"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOSController = void 0;
const sos_service_1 = require("./sos.service");
const response_1 = require("../../shared/utils/response");
const socket_service_1 = require("../../shared/services/socket.service");
class SOSController {
    sosService;
    constructor() {
        this.sosService = new sos_service_1.SOSService();
    }
    triggerSOS = async (req, res, next) => {
        try {
            const alert = await this.sosService.triggerAlert(req.user.id, req.body);
            // Emit Socket.IO event to all connected Police/Admin and Citizen clients
            (0, socket_service_1.broadcastEvent)('sos_alert', alert);
            (0, response_1.sendSuccess)(res, 201, alert, 'SOS Alert triggered successfully. Police have been notified.');
        }
        catch (error) {
            next(error);
        }
    };
    getAlert = async (req, res, next) => {
        try {
            const alert = await this.sosService.getAlertById(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, alert);
        }
        catch (error) {
            next(error);
        }
    };
    getActiveAlerts = async (req, res, next) => {
        try {
            const alerts = await this.sosService.getActiveAlerts();
            (0, response_1.sendSuccess)(res, 200, alerts);
        }
        catch (error) {
            next(error);
        }
    };
    resolveAlert = async (req, res, next) => {
        try {
            const alert = await this.sosService.resolveAlert(req.params.id);
            // Emit Socket.IO resolution event
            (0, socket_service_1.broadcastEvent)('sos_resolved', alert);
            (0, response_1.sendSuccess)(res, 200, alert, 'SOS Alert resolved successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.SOSController = SOSController;
