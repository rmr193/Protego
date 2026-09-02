import prisma from '../../core/prisma';

export class GDRepository {
  async createGD(data: any) {
    return prisma.generalDiary.create({ data });
  }

  async findGDById(id: string) {
    return prisma.generalDiary.findUnique({
      where: { gd_id: id },
      include: { user: { select: { full_name: true, email: true, phone: true } } }
    });
  }

  async findAllGDs(filters: any, skip: number, take: number) {
    const [gds, total] = await Promise.all([
      prisma.generalDiary.findMany({
        where: filters,
        skip,
        take,
        include: { user: { select: { full_name: true, phone: true } } },
        orderBy: { created_at: 'desc' }
      }),
      prisma.generalDiary.count({ where: filters })
    ]);
    return { gds, total };
  }

  async updateGD(id: string, data: any) {
    return prisma.generalDiary.update({
      where: { gd_id: id },
      data
    });
  }
}
