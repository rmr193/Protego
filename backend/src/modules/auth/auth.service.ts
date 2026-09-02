import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../shared/utils/AppError';
import { env } from '../../config/env';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private signTokens(user: any) {
    const roleName = user.role?.name || (typeof user.role === 'string' ? user.role : 'CITIZEN');
    const accessToken = jwt.sign(
      { id: user.user_id, role: roleName },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { id: user.user_id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
    );

    return { accessToken, refreshToken };
  }

  async register(data: any) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const defaultRole = await this.authRepository.findRoleByName('CITIZEN');
    if (!defaultRole) {
      throw new AppError('Default role not found. Please seed the database.', 500);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const newUser = await this.authRepository.createUser({
      ...data,
      email,
      password: hashedPassword,
      role_id: defaultRole.role_id
    });

    const tokens = this.signTokens(newUser);
    
    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await this.authRepository.createRefreshToken(newUser.user_id, tokens.refreshToken, expiresAt);

    // Remove password from response
    delete (newUser as any).password;

    return { user: newUser, ...tokens };
  }

  async login(data: any) {
    const email = data.email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    const tokens = this.signTokens(user);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.createRefreshToken(user.user_id, tokens.refreshToken, expiresAt);

    delete (user as any).password;

    return { user, ...tokens };
  }

  async refreshTokens(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
      const savedToken = await this.authRepository.findRefreshToken(token);

      if (!savedToken || savedToken.user_id !== decoded.id) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokens = this.signTokens(savedToken.user);

      // Rotate tokens
      await this.authRepository.deleteRefreshToken(token);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await this.authRepository.createRefreshToken(savedToken.user_id, tokens.refreshToken, expiresAt);

      return tokens;
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async logout(token: string) {
    if (!token) return;
    await this.authRepository.deleteRefreshToken(token);
  }
}
