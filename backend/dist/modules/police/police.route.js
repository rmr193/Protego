"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const police_controller_1 = require("./police.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const police_validation_1 = require("./police.validation");
const router = (0, express_1.Router)();
const policeController = new police_controller_1.PoliceController();
// Protect all police routes
router.use(auth_middleware_1.authenticate);
// ==========================================
// Police Stations Routes
// ==========================================
router.get('/stations', policeController.getAllStations);
router.get('/stations/:id', policeController.getStation);
// Police Officer routes for station management
router.use('/stations', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'));
router.post('/stations', (0, validate_middleware_1.validate)(police_validation_1.createStationSchema), policeController.createStation);
router.patch('/stations/:id', (0, validate_middleware_1.validate)(police_validation_1.updateStationSchema), policeController.updateStation);
router.delete('/stations/:id', policeController.deleteStation);
// ==========================================
// Police Officers Routes
// ==========================================
// Any authenticated user might need to see officer info (e.g., who is assigned to their case)
// So reading officers could be accessible, but we'll restrict list to Police
router.get('/officers', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), policeController.getAllOfficers);
router.get('/officers/:id', policeController.getOfficer);
// Police only routes for officer management
router.post('/officers', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(police_validation_1.createOfficerSchema), policeController.createOfficer);
router.patch('/officers/:id', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), (0, validate_middleware_1.validate)(police_validation_1.updateOfficerSchema), policeController.updateOfficer);
router.delete('/officers/:id', (0, auth_middleware_1.restrictTo)('POLICE_OFFICER'), policeController.deleteOfficer);
exports.default = router;
