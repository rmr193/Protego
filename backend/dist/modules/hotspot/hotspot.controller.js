"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotspotController = void 0;
const hotspot_service_1 = require("./hotspot.service");
const response_1 = require("../../shared/utils/response");
class HotspotController {
    hotspotService;
    constructor() {
        this.hotspotService = new hotspot_service_1.HotspotService();
    }
    addHotspot = async (req, res, next) => {
        try {
            const hotspot = await this.hotspotService.addHotspot(req.body);
            (0, response_1.sendSuccess)(res, 201, hotspot, 'Crime Hotspot added successfully');
        }
        catch (error) {
            next(error);
        }
    };
    getAllHotspots = async (req, res, next) => {
        try {
            const hotspots = await this.hotspotService.getAllHotspots();
            (0, response_1.sendSuccess)(res, 200, hotspots);
        }
        catch (error) {
            next(error);
        }
    };
    updateHotspot = async (req, res, next) => {
        try {
            const hotspot = await this.hotspotService.updateHotspot(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 200, hotspot, 'Crime Hotspot updated successfully');
        }
        catch (error) {
            next(error);
        }
    };
    deleteHotspot = async (req, res, next) => {
        try {
            await this.hotspotService.deleteHotspot(req.params.id);
            (0, response_1.sendSuccess)(res, 200, null, 'Crime Hotspot deleted successfully');
        }
        catch (error) {
            next(error);
        }
    };
}
exports.HotspotController = HotspotController;
