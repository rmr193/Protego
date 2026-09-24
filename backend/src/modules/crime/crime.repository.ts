import prisma from '../../core/prisma';

export class CrimeRepository {
  async createReport(data: any) {
    return prisma.crimeReport.create({ data });
  }

  async findReportById(id: string) {
    if (id.toUpperCase().startsWith('CR-') || (id.length === 8 && /^[0-9a-f]{8}$/i.test(id))) {
      const clean = id.replace(/^CR-/i, '').toLowerCase();
      const report = await prisma.crimeReport.findFirst({
        where: { report_id: { startsWith: clean, mode: 'insensitive' } },
        include: { 
          user: { select: { full_name: true, email: true, phone: true } },
          evidence: true,
          ai_analysis: true
        }
      });
      if (report) return report;
    }

    return prisma.crimeReport.findUnique({
      where: { report_id: id },
      include: { 
        user: { select: { full_name: true, email: true, phone: true } },
        evidence: true,
        ai_analysis: true
      }
    });
  }

  async findAllReports(filters: any, skip: number, take: number) {
    const [reports, total] = await Promise.all([
      prisma.crimeReport.findMany({
        where: filters,
        skip,
        take,
        include: { 
          user: { select: { full_name: true, phone: true } },
          ai_analysis: { select: { severity_score: true, is_fake: true } }
        },
        orderBy: { date_time: 'desc' }
      }),
      prisma.crimeReport.count({ where: filters })
    ]);
    return { reports, total };
  }

  async updateReportStatus(id: string, status: string) {
    let targetId = id;
    if (id.toUpperCase().startsWith('CR-') || (id.length === 8 && /^[0-9a-f]{8}$/i.test(id))) {
      const clean = id.replace(/^CR-/i, '').toLowerCase();
      const existing = await prisma.crimeReport.findFirst({
        where: { report_id: { startsWith: clean, mode: 'insensitive' } },
        select: { report_id: true }
      });
      if (existing) {
        targetId = existing.report_id;
      }
    }

    return prisma.crimeReport.update({
      where: { report_id: targetId },
      data: { status }
    });
  }

  async findMapReports(limit: number = 100) {
    return prisma.crimeReport.findMany({
      take: limit,
      select: {
        report_id: true,
        crime_type: true,
        description: true,
        location: true,
        date_time: true,
        status: true,
        user: { select: { full_name: true } }
      },
      orderBy: { date_time: 'desc' }
    });
  }
}
