"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crime_service_1 = require("./crime.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./crime.repository');
describe('CrimeService', () => {
    let crimeService;
    let mockCrimeRepo;
    beforeEach(() => {
        mockCrimeRepo = {
            createReport: jest.fn(),
            findReportById: jest.fn(),
            findAllReports: jest.fn(),
            updateReportStatus: jest.fn()
        };
        crimeService = new crime_service_1.CrimeService();
        crimeService.crimeRepository = mockCrimeRepo;
    });
    describe('createReport', () => {
        it('should create a Crime Report with PENDING status', async () => {
            const mockReport = { report_id: 'r1', crime_type: 'Theft', status: 'PENDING' };
            mockCrimeRepo.createReport.mockResolvedValue(mockReport);
            const result = await crimeService.createReport('user1', {
                crime_type: 'Theft',
                description: 'Stolen laptop',
                location: 'Dhaka',
                date_time: '2023-01-01T12:00:00Z'
            });
            expect(mockCrimeRepo.createReport).toHaveBeenCalled();
            expect(result.status).toBe('PENDING');
        });
    });
    describe('getReportById', () => {
        it('should allow citizen to view their own report', async () => {
            const mockReport = { report_id: '1', user_id: 'user1' };
            mockCrimeRepo.findReportById.mockResolvedValue(mockReport);
            const report = await crimeService.getReportById('1', 'user1', 'CITIZEN');
            expect(report.user_id).toBe('user1');
        });
        it('should throw AppError if citizen views someone else report', async () => {
            const mockReport = { report_id: '1', user_id: 'other_user' };
            mockCrimeRepo.findReportById.mockResolvedValue(mockReport);
            await expect(crimeService.getReportById('1', 'user1', 'CITIZEN')).rejects.toThrow(AppError_1.AppError);
        });
    });
});
