"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseController = void 0;
const case_service_1 = require("./case.service");
const response_1 = require("../../shared/utils/response");
class CaseController {
    caseService;
    constructor() {
        this.caseService = new case_service_1.CaseService();
    }
    createCase = async (req, res, next) => {
        try {
            const caseData = await this.caseService.createCase(req.body);
            (0, response_1.sendSuccess)(res, 201, caseData, 'Case created and officer assigned successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getCase = async (req, res, next) => {
        try {
            const caseData = await this.caseService.getCaseById(req.params.id, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 200, caseData);
        }
        catch (error) {
            next(error);
        }
    };
    getAllCases = async (req, res, next) => {
        try {
            // Allow fetching assigned cases for officers
            const filters = {
                officer_id: req.query.officer_id
            };
            const cases = await this.caseService.getAllCases(req.user.id, req.user.role, filters);
            (0, response_1.sendSuccess)(res, 200, cases);
        }
        catch (error) {
            next(error);
        }
    };
    addTrackingUpdate = async (req, res, next) => {
        try {
            const tracking = await this.caseService.addTrackingUpdate(req.params.id, req.body.status_update, req.user.id, req.user.role);
            (0, response_1.sendSuccess)(res, 201, tracking, 'Tracking updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CaseController = CaseController;
