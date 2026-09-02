import prisma from '../../core/prisma';

export class PoliceRepository {
  // --- Stations ---
  async createStation(data: any) {
    return prisma.policeStation.create({ data });
  }

  async findStationById(id: string) {
    return prisma.policeStation.findUnique({
      where: { station_id: id },
      include: { officers: true }
    });
  }

  async findAllStations() {
    return prisma.policeStation.findMany();
  }

  async updateStation(id: string, data: any) {
    return prisma.policeStation.update({
      where: { station_id: id },
      data
    });
  }

  async deleteStation(id: string) {
    return prisma.policeStation.delete({
      where: { station_id: id }
    });
  }

  // --- Officers ---
  async createOfficer(data: any) {
    return prisma.policeOfficer.create({ data });
  }

  async findOfficerById(id: string) {
    return prisma.policeOfficer.findUnique({
      where: { officer_id: id },
      include: { station: true, cases: true }
    });
  }

  async findAllOfficers(stationId?: string) {
    return prisma.policeOfficer.findMany({
      where: stationId ? { station_id: stationId } : {},
      include: { station: true }
    });
  }

  async updateOfficer(id: string, data: any) {
    return prisma.policeOfficer.update({
      where: { officer_id: id },
      data
    });
  }

  async deleteOfficer(id: string) {
    return prisma.policeOfficer.delete({
      where: { officer_id: id }
    });
  }
}
