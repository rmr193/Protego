"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliceRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class PoliceRepository {
    // --- Stations ---
    async createStation(data) {
        return prisma_1.default.policeStation.create({ data });
    }
    async findStationById(id) {
        return prisma_1.default.policeStation.findUnique({
            where: { station_id: id },
            include: { officers: true }
        });
    }
    async findAllStations() {
        return prisma_1.default.policeStation.findMany();
    }
    async updateStation(id, data) {
        return prisma_1.default.policeStation.update({
            where: { station_id: id },
            data
        });
    }
    async deleteStation(id) {
        return prisma_1.default.policeStation.delete({
            where: { station_id: id }
        });
    }
    // --- Officers ---
    async createOfficer(data) {
        return prisma_1.default.policeOfficer.create({ data });
    }
    async findOfficerById(id) {
        return prisma_1.default.policeOfficer.findUnique({
            where: { officer_id: id },
            include: { station: true, cases: true }
        });
    }
    async findAllOfficers(stationId) {
        return prisma_1.default.policeOfficer.findMany({
            where: stationId ? { station_id: stationId } : {},
            include: { station: true }
        });
    }
    async updateOfficer(id, data) {
        return prisma_1.default.policeOfficer.update({
            where: { officer_id: id },
            data
        });
    }
    async deleteOfficer(id) {
        return prisma_1.default.policeOfficer.delete({
            where: { officer_id: id }
        });
    }
}
exports.PoliceRepository = PoliceRepository;
