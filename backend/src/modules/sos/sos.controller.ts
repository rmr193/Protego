import { Request, Response, NextFunction } from 'express';
import { SOSService } from './sos.service';
import { sendSuccess } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middlewares/auth.middleware';
import { broadcastEvent } from '../../shared/services/socket.service';

export class SOSController {
  private sosService: SOSService;

  constructor() {
    this.sosService = new SOSService();
  }

  triggerSOS = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await this.sosService.triggerAlert(req.user!.id, req.body);
      
      // Emit Socket.IO event to all connected Police/Admin and Citizen clients
      broadcastEvent('sos_alert', alert);
      
      sendSuccess(res, 201, alert, 'SOS Alert triggered successfully. Police have been notified.');
    } catch (error) {
      next(error);
    }
  };

  getAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await this.sosService.getAlertById(req.params.id as string, req.user!.id, req.user!.role);
      sendSuccess(res, 200, alert);
    } catch (error) {
      next(error);
    }
  };

  getActiveAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await this.sosService.getActiveAlerts();
      sendSuccess(res, 200, alerts);
    } catch (error) {
      next(error);
    }
  };

  getMyActiveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await this.sosService.getUserActiveAlert(req.user!.id);
      sendSuccess(res, 200, alert);
    } catch (error) {
      next(error);
    }
  };

  resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alert = await this.sosService.resolveAlert(req.params.id as string, req.user?.id, req.user?.role);
      
      // Emit Socket.IO resolution event
      broadcastEvent('sos_resolved', alert);

      sendSuccess(res, 200, alert, 'SOS Alert resolved successfully');
    } catch (error) {
      next(error);
    }
  };
}

