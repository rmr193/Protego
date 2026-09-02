import prisma from '../../core/prisma';

export class SOSRepository {
  async triggerAlert(data: { user_id: string; live_location: string; emergency_type: string }) {
    return prisma.sOSAlert.create({
      data: {
        ...data,
        status: 'ACTIVE'
      }
    });
  }

  async findAlertById(id: string) {
    return prisma.sOSAlert.findUnique({
      where: { sos_id: id },
      include: { user: { select: { full_name: true, phone: true } } }
    });
  }

  async getActiveAlerts() {
    return prisma.sOSAlert.findMany({
      where: { status: 'ACTIVE' },
      include: { user: { select: { full_name: true, phone: true } } },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateAlertStatus(id: string, status: string) {
    return prisma.sOSAlert.update({
      where: { sos_id: id },
      data: { status }
    });
  }
}
