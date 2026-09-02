"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const case_service_1 = require("./case.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./case.repository');
describe('CaseService', () => {
    let caseService;
    let mockCaseRepo;
    beforeEach(() => {
        mockCaseRepo = {
            createCase: jest.fn(),
            findCaseById: jest.fn(),
            findAllCases: jest.fn(),
            updateCase: jest.fn()
        };
        caseService = new case_service_1.CaseService();
        caseService.caseRepository = mockCaseRepo;
    });
    describe('createCase', () => {
        it('should create a new case', async () => {
            mockCaseRepo.createCase.mockResolvedValue({ case_id: 'c1', case_status: 'OPEN' });
            const result = await caseService.createCase({ report_id: 'r1', officer_id: 'o1' });
            expect(result.case_status).toBe('OPEN');
        });
    });
    describe('getCaseById', () => {
        it('should allow citizen to view their own case', async () => {
            const mockCase = { case_id: 'c1', crime_report: { user_id: 'user1' } };
            mockCaseRepo.findCaseById.mockResolvedValue(mockCase);
            const result = await caseService.getCaseById('c1', 'user1', 'CITIZEN');
            expect(result.case_id).toBe('c1');
        });
        it('should throw AppError if citizen views someone elses case', async () => {
            const mockCase = { case_id: 'c1', crime_report: { user_id: 'other' } };
            mockCaseRepo.findCaseById.mockResolvedValue(mockCase);
            await expect(caseService.getCaseById('c1', 'user1', 'CITIZEN')).rejects.toThrow(AppError_1.AppError);
        });
    });
});
