import { HotspotRepository } from './hotspot.repository';

export class HotspotService {
  private hotspotRepository: HotspotRepository;

  constructor() {
    this.hotspotRepository = new HotspotRepository();
  }

  async addHotspot(data: { location: string; crime_count: number; risk_level: string }) {
    return this.hotspotRepository.addHotspot(data);
  }

  async getAllHotspots() {
    return this.hotspotRepository.getAllHotspots();
  }

  async updateHotspot(id: string, data: Partial<{ crime_count: number; risk_level: string }>) {
    return this.hotspotRepository.updateHotspot(id, data);
  }

  async deleteHotspot(id: string) {
    return this.hotspotRepository.deleteHotspot(id);
  }
}
