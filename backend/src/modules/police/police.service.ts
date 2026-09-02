import { PoliceRepository } from './police.repository';
import { AppError } from '../../shared/utils/AppError';

export class PoliceService {
  private policeRepository: PoliceRepository;

  constructor() {
    this.policeRepository = new PoliceRepository();
  }

  // --- Stations ---
  async createStation(data: any) {
    return this.policeRepository.createStation(data);
  }

  async getStation(id: string) {
    const station = await this.policeRepository.findStationById(id);
    if (!station) throw new AppError('Police Station not found', 404);
    return station;
  }

  async getAllStations() {
    return this.policeRepository.findAllStations();
  }

  async updateStation(id: string, data: any) {
    await this.getStation(id); // Check exists
    return this.policeRepository.updateStation(id, data);
  }

  async deleteStation(id: string) {
    await this.getStation(id);
    return this.policeRepository.deleteStation(id);
  }

  // --- Officers ---
  async createOfficer(data: any) {
    // Validate station exists
    await this.getStation(data.station_id);
    return this.policeRepository.createOfficer(data);
  }

  async getOfficer(id: string) {
    const officer = await this.policeRepository.findOfficerById(id);
    if (!officer) throw new AppError('Police Officer not found', 404);
    return officer;
  }

  async getAllOfficers(stationId?: string) {
    return this.policeRepository.findAllOfficers(stationId);
  }

  async updateOfficer(id: string, data: any) {
    await this.getOfficer(id);
    if (data.station_id) {
      await this.getStation(data.station_id);
    }
    return this.policeRepository.updateOfficer(id, data);
  }

  async deleteOfficer(id: string) {
    await this.getOfficer(id);
    return this.policeRepository.deleteOfficer(id);
  }
}
