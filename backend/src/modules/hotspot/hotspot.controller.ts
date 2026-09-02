import { Request, Response, NextFunction } from 'express';
import { HotspotService } from './hotspot.service';
import { sendSuccess } from '../../shared/utils/response';

export class HotspotController {
  private hotspotService: HotspotService;

  constructor() {
    this.hotspotService = new HotspotService();
  }

  addHotspot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotspot = await this.hotspotService.addHotspot(req.body);
      sendSuccess(res, 201, hotspot, 'Crime Hotspot added successfully');
    } catch (error) {
      next(error);
    }
  };

  getAllHotspots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotspots = await this.hotspotService.getAllHotspots();
      sendSuccess(res, 200, hotspots);
    } catch (error) {
      next(error);
    }
  };

  updateHotspot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotspot = await this.hotspotService.updateHotspot(req.params.id as string, req.body);
      sendSuccess(res, 200, hotspot, 'Crime Hotspot updated successfully');
    } catch (error) {
      next(error);
    }
  };

  deleteHotspot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.hotspotService.deleteHotspot(req.params.id as string);
      sendSuccess(res, 200, null, 'Crime Hotspot deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
