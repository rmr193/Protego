import { UserRepository } from './user.repository';
import { AppError } from '../../shared/utils/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    delete (user as any).password;
    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { users, total } = await this.userRepository.findAll(skip, limit);
    
    // Remove passwords
    const sanitizedUsers = (users as any[]).map((user: any) => {
      delete user.password;
      return user;
    });

    return {
      users: sanitizedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateProfile(userId: string, data: any) {
    // Ensure sensitive fields cannot be updated directly
    delete data.password;
    delete data.role_id;
    delete data.email; // Email changes might require verification logic

    const user = await this.userRepository.update(userId, data);
    delete (user as any).password;
    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    await this.userRepository.delete(userId);
  }
}
