"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliceService = void 0;
const police_repository_1 = require("./police.repository");
const AppError_1 = require("../../shared/utils/AppError");
class PoliceService {
    policeRepository;
    constructor() {
        this.policeRepository = new police_repository_1.PoliceRepository();
    }
    // --- Stations ---
    async createStation(data) {
        return this.policeRepository.createStation(data);
    }
    async getStation(id) {
        const station = await this.policeRepository.findStationById(id);
        if (!station)
            throw new AppError_1.AppError('Police Station not found', 404);
        return station;
    }
    async getAllStations() {
        return this.policeRepository.findAllStations();
    }
    async updateStation(id, data) {
        await this.getStation(id); // Check exists
        return this.policeRepository.updateStation(id, data);
    }
    async deleteStation(id) {
        await this.getStation(id);
        return this.policeRepository.deleteStation(id);
    }
    // --- Officers ---
    async createOfficer(data) {
        // Validate station exists
        await this.getStation(data.station_id);
        return this.policeRepository.createOfficer(data);
    }
    async getOfficer(id) {
        const officer = await this.policeRepository.findOfficerById(id);
        if (!officer)
            throw new AppError_1.AppError('Police Officer not found', 404);
        return officer;
    }
    async getAllOfficers(stationId) {
        return this.policeRepository.findAllOfficers(stationId);
    }
    async updateOfficer(id, data) {
        await this.getOfficer(id);
        if (data.station_id) {
            await this.getStation(data.station_id);
        }
        return this.policeRepository.updateOfficer(id, data);
    }
    async deleteOfficer(id) {
        await this.getOfficer(id);
        return this.policeRepository.deleteOfficer(id);
    }
}
exports.PoliceService = PoliceService;
