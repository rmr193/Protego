"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const police_service_1 = require("./police.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./police.repository');
describe('PoliceService', () => {
    let policeService;
    let mockPoliceRepo;
    beforeEach(() => {
        mockPoliceRepo = {
            findStationById: jest.fn(),
            findAllStations: jest.fn(),
            createOfficer: jest.fn(),
            findOfficersByStation: jest.fn()
        };
        policeService = new police_service_1.PoliceService();
        policeService.policeRepository = mockPoliceRepo;
    });
    describe('Stations', () => {
        it('should throw AppError if station not found', async () => {
            mockPoliceRepo.findStationById.mockResolvedValue(null);
            await expect(policeService.getStation('invalid_id')).rejects.toThrow(AppError_1.AppError);
        });
        it('should return station if found', async () => {
            const mockStation = { station_id: '1', station_name: 'Central HQ' };
            mockPoliceRepo.findStationById.mockResolvedValue(mockStation);
            const station = await policeService.getStation('1');
            expect(station.station_name).toBe('Central HQ');
        });
    });
    describe('Officers', () => {
        it('should create an officer if station exists', async () => {
            const mockStation = { station_id: '1' };
            const mockOfficer = { officer_id: 'o1', name: 'John', station_id: '1' };
            mockPoliceRepo.findStationById.mockResolvedValue(mockStation);
            mockPoliceRepo.createOfficer.mockResolvedValue(mockOfficer);
            const result = await policeService.createOfficer({ name: 'John', station_id: '1' });
            expect(result.officer_id).toBe('o1');
        });
        it('should throw AppError creating officer with invalid station', async () => {
            mockPoliceRepo.findStationById.mockResolvedValue(null);
            await expect(policeService.createOfficer({ name: 'John', station_id: 'bad_id' })).rejects.toThrow(AppError_1.AppError);
        });
    });
});
