import prisma from '../../core/prisma';

export class CaseRepository {
  async createCase(data: { report_id: string; officer_id: string; case_status: string }) {
    return prisma.case.create({
      data,
      include: {
        crime_report: true,
        police_officer: true
      }
    });
  }

  async findCaseById(id: string) {
    return prisma.case.findUnique({
      where: { case_id: id },
      include: {
        crime_report: { select: { user_id: true, crime_type: true, description: true } },
        police_officer: { select: { name: true, badge_number: true } },
        case_trackings: { orderBy: { updated_at: 'desc' } }
      }
    });
  }

  async findAllCases(filters: any) {
    return prisma.case.findMany({
      where: filters,
      include: {
        crime_report: { select: { crime_type: true } },
        police_officer: { select: { name: true } }
      },
      orderBy: { assigned_date: 'desc' }
    });
  }

  async addTrackingUpdate(data: { case_id: string; status_update: string; updated_by: string }) {
    return prisma.caseTracking.create({ data });
  }

  async updateCaseStatus(id: string, status: string) {
    return prisma.case.update({
      where: { case_id: id },
      data: { case_status: status }
    });
  }
}
