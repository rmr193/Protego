import prisma from '../../core/prisma';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
  }

  async findRoleByName(roleName: string) {
    return prisma.role.findUnique({
      where: { name: roleName }
    });
  }

  async createUser(data: any) {
    return prisma.user.create({
      data,
      include: { role: true }
    });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: expiresAt
      }
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { role: true } } }
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token }
    });
  }
}
