import { HotspotService } from './hotspot.service';
import { HotspotRepository } from './hotspot.repository';

jest.mock('./hotspot.repository');

describe('HotspotService', () => {
  let hotspotService: HotspotService;
  let mockHotspotRepo: jest.Mocked<HotspotRepository>;

  beforeEach(() => {
    mockHotspotRepo = {
      addHotspot: jest.fn(),
      getAllHotspots: jest.fn()
    } as any;
    hotspotService = new HotspotService();
    (hotspotService as any).hotspotRepository = mockHotspotRepo;
  });

  describe('addHotspot', () => {
    it('should add a hotspot successfully', async () => {
      mockHotspotRepo.addHotspot.mockResolvedValue({ hotspot_id: '1', location: 'Dhaka' } as any);

      const result = await hotspotService.addHotspot({ location: 'Dhaka', crime_count: 5, risk_level: 'HIGH' });
      expect(result.hotspot_id).toBe('1');
    });
  });

  describe('getAllHotspots', () => {
    it('should return list of hotspots', async () => {
      mockHotspotRepo.getAllHotspots.mockResolvedValue([{ hotspot_id: '1' }] as any);

      const result = await hotspotService.getAllHotspots();
      expect(result).toHaveLength(1);
    });
  });
});
