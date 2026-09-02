import { Router } from 'express';
import { PoliceController } from './police.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { 
  createStationSchema, 
  updateStationSchema, 
  createOfficerSchema, 
  updateOfficerSchema 
} from './police.validation';

const router = Router();
const policeController = new PoliceController();

// Protect all police routes
router.use(authenticate);

// ==========================================
// Police Stations Routes
// ==========================================
router.get('/stations', policeController.getAllStations);
router.get('/stations/:id', policeController.getStation);

// Police Officer routes for station management
router.use('/stations', restrictTo('POLICE_OFFICER'));
router.post('/stations', validate(createStationSchema), policeController.createStation);
router.patch('/stations/:id', validate(updateStationSchema), policeController.updateStation);
router.delete('/stations/:id', policeController.deleteStation);

// ==========================================
// Police Officers Routes
// ==========================================
// Any authenticated user might need to see officer info (e.g., who is assigned to their case)
// So reading officers could be accessible, but we'll restrict list to Police
router.get('/officers', restrictTo('POLICE_OFFICER'), policeController.getAllOfficers);
router.get('/officers/:id', policeController.getOfficer);

// Police only routes for officer management
router.post('/officers', restrictTo('POLICE_OFFICER'), validate(createOfficerSchema), policeController.createOfficer);
router.patch('/officers/:id', restrictTo('POLICE_OFFICER'), validate(updateOfficerSchema), policeController.updateOfficer);
router.delete('/officers/:id', restrictTo('POLICE_OFFICER'), policeController.deleteOfficer);

export default router;
