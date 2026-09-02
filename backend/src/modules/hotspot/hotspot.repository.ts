import prisma from '../../core/prisma';

export class HotspotRepository {
  async addHotspot(data: { location: string; crime_count: number; risk_level: string }) {
    return prisma.crimeHotspot.create({ data });
  }

  async getAllHotspots() {
    return prisma.crimeHotspot.findMany({
      orderBy: { crime_count: 'desc' }
    });
  }

  async updateHotspot(id: string, data: Partial<{ crime_count: number; risk_level: string }>) {
    return prisma.crimeHotspot.update({
      where: { hotspot_id: id },
      data
    });
  }

  async deleteHotspot(id: string) {
    return prisma.crimeHotspot.delete({
      where: { hotspot_id: id }
    });
  }
}
