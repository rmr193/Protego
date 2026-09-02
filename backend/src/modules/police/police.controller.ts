import { Request, Response, NextFunction } from 'express';
import { PoliceService } from './police.service';
import { sendSuccess } from '../../shared/utils/response';

export class PoliceController {
  private policeService: PoliceService;

  constructor() {
    this.policeService = new PoliceService();
  }

  // --- Stations ---
  createStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const station = await this.policeService.createStation(req.body);
      sendSuccess(res, 201, station, 'Police Station created successfully');
    } catch (error) {
      next(error);
    }
  };

  getStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const station = await this.policeService.getStation(req.params.id as string);
      sendSuccess(res, 200, station);
    } catch (error) {
      next(error);
    }
  };

  getAllStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stations = await this.policeService.getAllStations();
      sendSuccess(res, 200, stations);
    } catch (error) {
      next(error);
    }
  };

  updateStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const station = await this.policeService.updateStation(req.params.id as string, req.body);
      sendSuccess(res, 200, station, 'Police Station updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.policeService.deleteStation(req.params.id as string);
      sendSuccess(res, 200, null, 'Police Station deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  // --- Officers ---
  createOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const officer = await this.policeService.createOfficer(req.body);
      sendSuccess(res, 201, officer, 'Police Officer created successfully');
    } catch (error) {
      next(error);
    }
  };

  getOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const officer = await this.policeService.getOfficer(req.params.id as string);
      sendSuccess(res, 200, officer);
    } catch (error) {
      next(error);
    }
  };

  getAllOfficers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stationId = req.query.station_id as string;
      const officers = await this.policeService.getAllOfficers(stationId);
      sendSuccess(res, 200, officers);
    } catch (error) {
      next(error);
    }
  };

  updateOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const officer = await this.policeService.updateOfficer(req.params.id as string, req.body);
      sendSuccess(res, 200, officer, 'Police Officer updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteOfficer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.policeService.deleteOfficer(req.params.id as string);
      sendSuccess(res, 200, null, 'Police Officer deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
