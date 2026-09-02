import prisma from '../../core/prisma';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { user_id: id },
      include: { role: true },
    });
  }

  async findAll(skip: number, take: number) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        include: { role: true },
        orderBy: { created_at: 'desc' }
      }),
      prisma.user.count()
    ]);
    return { users, total };
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { user_id: id },
      data,
      include: { role: true }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { user_id: id }
    });
  }
}
