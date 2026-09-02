"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = require("./user.service");
const AppError_1 = require("../../shared/utils/AppError");
jest.mock('./user.repository');
describe('UserService', () => {
    let userService;
    let mockUserRepo;
    beforeEach(() => {
        mockUserRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn()
        };
        userService = new user_service_1.UserService();
        userService.userRepository = mockUserRepo;
    });
    describe('getProfile', () => {
        it('should throw an error if user not found', async () => {
            mockUserRepo.findById.mockResolvedValue(null);
            await expect(userService.getProfile('invalid_id')).rejects.toThrow(AppError_1.AppError);
        });
        it('should return user profile without password', async () => {
            mockUserRepo.findById.mockResolvedValue({ user_id: '1', password: 'secret', full_name: 'John' });
            const user = await userService.getProfile('1');
            expect(user).not.toHaveProperty('password');
            expect(user.full_name).toBe('John');
        });
    });
    describe('getAllUsers', () => {
        it('should return paginated users without passwords', async () => {
            mockUserRepo.findAll.mockResolvedValue({
                users: [{ user_id: '1', password: 'p1' }, { user_id: '2', password: 'p2' }],
                total: 2
            });
            const result = await userService.getAllUsers(1, 10);
            expect(result.users).toHaveLength(2);
            expect(result.users[0]).not.toHaveProperty('password');
            expect(result.meta.total).toBe(2);
        });
    });
    describe('updateProfile', () => {
        it('should correctly omit sensitive fields before updating', async () => {
            mockUserRepo.update.mockResolvedValue({ user_id: '1', full_name: 'Updated' });
            const updateData = { full_name: 'Updated', password: 'new', role_id: 'police' };
            const user = await userService.updateProfile('1', updateData);
            expect(mockUserRepo.update).toHaveBeenCalledWith('1', { full_name: 'Updated' });
            expect(user.full_name).toBe('Updated');
        });
    });
});
