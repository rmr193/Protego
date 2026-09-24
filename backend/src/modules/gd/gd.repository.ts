import prisma from '../../core/prisma';

export class GDRepository {
  async createGD(data: any) {
    return prisma.generalDiary.create({ data });
  }

  async findGDById(id: string) {
    if (id.toUpperCase().startsWith('GD-') || (id.length === 8 && /^[0-9a-f]{8}$/i.test(id))) {
      const clean = id.replace(/^GD-/i, '').toLowerCase();
      const gd = await prisma.generalDiary.findFirst({
        where: { gd_id: { startsWith: clean, mode: 'insensitive' } },
        include: { user: { select: { full_name: true, email: true, phone: true } } }
      });
      if (gd) return gd;
    }

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
    let targetId = id;
    if (id.toUpperCase().startsWith('GD-') || (id.length === 8 && /^[0-9a-f]{8}$/i.test(id))) {
      const clean = id.replace(/^GD-/i, '').toLowerCase();
      const existing = await prisma.generalDiary.findFirst({
        where: { gd_id: { startsWith: clean, mode: 'insensitive' } },
        select: { gd_id: true }
      });
      if (existing) {
        targetId = existing.gd_id;
      }
    }

    return prisma.generalDiary.update({
      where: { gd_id: targetId },
      data
    });
  }

  async findMapGDs(limit: number = 100) {
    return prisma.generalDiary.findMany({
      take: limit,
      select: {
        gd_id: true,
        title: true,
        description: true,
        status: true,
        created_at: true,
        user: { select: { full_name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }
}
