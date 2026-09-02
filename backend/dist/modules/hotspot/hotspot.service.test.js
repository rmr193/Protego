"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hotspot_service_1 = require("./hotspot.service");
jest.mock('./hotspot.repository');
describe('HotspotService', () => {
    let hotspotService;
    let mockHotspotRepo;
    beforeEach(() => {
        mockHotspotRepo = {
            addHotspot: jest.fn(),
            getAllHotspots: jest.fn()
        };
        hotspotService = new hotspot_service_1.HotspotService();
        hotspotService.hotspotRepository = mockHotspotRepo;
    });
    describe('addHotspot', () => {
        it('should add a hotspot successfully', async () => {
            mockHotspotRepo.addHotspot.mockResolvedValue({ hotspot_id: '1', location: 'Dhaka' });
            const result = await hotspotService.addHotspot({ location: 'Dhaka', crime_count: 5, risk_level: 'HIGH' });
            expect(result.hotspot_id).toBe('1');
        });
    });
    describe('getAllHotspots', () => {
        it('should return list of hotspots', async () => {
            mockHotspotRepo.getAllHotspots.mockResolvedValue([{ hotspot_id: '1' }]);
            const result = await hotspotService.getAllHotspots();
            expect(result).toHaveLength(1);
        });
    });
});
