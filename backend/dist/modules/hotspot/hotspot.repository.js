"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotRepository = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
class HotspotRepository {
    async addHotspot(data) {
        return prisma_1.default.crimeHotspot.create({ data });
    }
    async getAllHotspots() {
        return prisma_1.default.crimeHotspot.findMany({
            orderBy: { crime_count: 'desc' }
        });
    }
    async updateHotspot(id, data) {
        return prisma_1.default.crimeHotspot.update({
            where: { hotspot_id: id },
            data
        });
    }
    async deleteHotspot(id) {
        return prisma_1.default.crimeHotspot.delete({
            where: { hotspot_id: id }
        });
    }
}
exports.HotspotRepository = HotspotRepository;
