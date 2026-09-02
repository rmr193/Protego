"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliceController = void 0;
const police_service_1 = require("./police.service");
const response_1 = require("../../shared/utils/response");
class PoliceController {
    policeService;
    constructor() {
        this.policeService = new police_service_1.PoliceService();
    }
    // --- Stations ---
    createStation = async (req, res, next) => {
        try {
            const station = await this.policeService.createStation(req.body);
            (0, response_1.sendSuccess)(res, 201, station, 'Police Station created successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getStation = async (req, res, next) => {
        try {
            const station = await this.policeService.getStation(req.params.id);
            (0, response_1.sendSuccess)(res, 200, station);
        }
        catch (error) {
            next(error);
        }
    };
    getAllStations = async (req, res, next) => {
        try {
            const stations = await this.policeService.getAllStations();
            (0, response_1.sendSuccess)(res, 200, stations);
        }
        catch (error) {
            next(error);
        }
    };
    updateStation = async (req, res, next) => {
        try {
            const station = await this.policeService.updateStation(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 200, station, 'Police Station updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteStation = async (req, res, next) => {
        try {
            await this.policeService.deleteStation(req.params.id);
            (0, response_1.sendSuccess)(res, 200, null, 'Police Station deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
    // --- Officers ---
    createOfficer = async (req, res, next) => {
        try {
            const officer = await this.policeService.createOfficer(req.body);
            (0, response_1.sendSuccess)(res, 201, officer, 'Police Officer created successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getOfficer = async (req, res, next) => {
        try {
            const officer = await this.policeService.getOfficer(req.params.id);
            (0, response_1.sendSuccess)(res, 200, officer);
        }
        catch (error) {
            next(error);
        }
    };
    getAllOfficers = async (req, res, next) => {
        try {
            const stationId = req.query.station_id;
            const officers = await this.policeService.getAllOfficers(stationId);
            (0, response_1.sendSuccess)(res, 200, officers);
        }
        catch (error) {
            next(error);
        }
    };
    updateOfficer = async (req, res, next) => {
        try {
            const officer = await this.policeService.updateOfficer(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 200, officer, 'Police Officer updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteOfficer = async (req, res, next) => {
        try {
            await this.policeService.deleteOfficer(req.params.id);
            (0, response_1.sendSuccess)(res, 200, null, 'Police Officer deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.PoliceController = PoliceController;
