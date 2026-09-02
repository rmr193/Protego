"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotService = void 0;
const hotspot_repository_1 = require("./hotspot.repository");
class HotspotService {
    hotspotRepository;
    constructor() {
        this.hotspotRepository = new hotspot_repository_1.HotspotRepository();
    }
    async addHotspot(data) {
        return this.hotspotRepository.addHotspot(data);
    }
    async getAllHotspots() {
        return this.hotspotRepository.getAllHotspots();
    }
    async updateHotspot(id, data) {
        return this.hotspotRepository.updateHotspot(id, data);
    }
    async deleteHotspot(id) {
        return this.hotspotRepository.deleteHotspot(id);
    }
}
exports.HotspotService = HotspotService;
