import { PoliceService } from './police.service';
import { PoliceRepository } from './police.repository';
import { AppError } from '../../shared/utils/AppError';

jest.mock('./police.repository');

describe('PoliceService', () => {
  let policeService: PoliceService;
  let mockPoliceRepo: jest.Mocked<PoliceRepository>;

  beforeEach(() => {
    mockPoliceRepo = {
      findStationById: jest.fn(),
      findAllStations: jest.fn(),
      createOfficer: jest.fn(),
      findOfficersByStation: jest.fn()
    } as any;
    policeService = new PoliceService();
    (policeService as any).policeRepository = mockPoliceRepo;
  });

  describe('Stations', () => {
    it('should throw AppError if station not found', async () => {
      mockPoliceRepo.findStationById.mockResolvedValue(null);
      await expect(policeService.getStation('invalid_id')).rejects.toThrow(AppError);
    });

    it('should return station if found', async () => {
      const mockStation = { station_id: '1', station_name: 'Central HQ' };
      mockPoliceRepo.findStationById.mockResolvedValue(mockStation as any);
      const station = await policeService.getStation('1');
      expect(station.station_name).toBe('Central HQ');
    });
  });

  describe('Officers', () => {
    it('should create an officer if station exists', async () => {
      const mockStation = { station_id: '1' };
      const mockOfficer = { officer_id: 'o1', name: 'John', station_id: '1' };
      
      mockPoliceRepo.findStationById.mockResolvedValue(mockStation as any);
      mockPoliceRepo.createOfficer.mockResolvedValue(mockOfficer as any);

      const result = await policeService.createOfficer({ name: 'John', station_id: '1' });
      expect(result.officer_id).toBe('o1');
    });

    it('should throw AppError creating officer with invalid station', async () => {
      mockPoliceRepo.findStationById.mockResolvedValue(null);
      await expect(policeService.createOfficer({ name: 'John', station_id: 'bad_id' })).rejects.toThrow(AppError);
    });
  });
});
