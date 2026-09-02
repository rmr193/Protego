import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import bcrypt from 'bcrypt';
import { AppError } from '../../shared/utils/AppError';

// Mock dependencies
jest.mock('./auth.repository');
const mockHash = jest.fn().mockResolvedValue('hashed_password');
const mockCompare = jest.fn().mockResolvedValue(true);
jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: mockHash,
    compare: mockCompare
  },
  hash: mockHash,
  compare: mockCompare
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
  verify: jest.fn().mockReturnValue({ id: '123' })
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepo: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: jest.fn(),
      findRoleByName: jest.fn(),
      createUser: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn()
    } as any;
    authService = new AuthService();
    (authService as any).authRepository = mockAuthRepo;
  });

  describe('register', () => {
    it('should throw an error if email already exists', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValue({ id: '1' } as any);

      await expect(authService.register({ email: 'test@test.com' }))
        .rejects
        .toThrow(AppError);
    });

    it('should register a new user successfully', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValue(null);
      mockAuthRepo.findRoleByName.mockResolvedValue({ role_id: 'r1', name: 'CITIZEN' } as any);
      mockHash.mockResolvedValue('hashed_password');
      
      const mockUser = { user_id: '1', email: 'test@test.com', role: { name: 'CITIZEN' } };
      mockAuthRepo.createUser.mockResolvedValue(mockUser as any);
      mockAuthRepo.createRefreshToken.mockResolvedValue({} as any);

      const result = await authService.register({
        email: 'test@test.com',
        password: 'password123',
        full_name: 'Test User',
        phone: '1234567890'
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should throw an error on invalid credentials', async () => {
      mockAuthRepo.findUserByEmail.mockResolvedValue(null);
      
      await expect(authService.login({ email: 'wrong@test.com', password: '123' }))
        .rejects
        .toThrow(AppError);
    });
  });
});
