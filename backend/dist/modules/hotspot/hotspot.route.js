"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotspot_controller_1 = require("./hotspot.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const validate_middleware_1 = require("../../shared/middlewares/validate.middleware");
const hotspot_validation_1 = require("./hotspot.validation");
const router = (0, express_1.Router)();
const hotspotController = new hotspot_controller_1.HotspotController();
// Protect all hotspot routes
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/v1/hotspots
 * @desc    Get all crime hotspots
 * @access  Private (All authenticated users)
 */
router.get('/', hotspotController.getAllHotspots);
// ==========================================
// Police Officer Only Routes
// ==========================================
router.use((0, auth_middleware_1.restrictTo)('POLICE_OFFICER'));
/**
 * @route   POST /api/v1/hotspots
 * @desc    Add a new crime hotspot manually
 * @access  Private (Police_Officer)
 */
router.post('/', (0, validate_middleware_1.validate)(hotspot_validation_1.addHotspotSchema), hotspotController.addHotspot);
/**
 * @route   PATCH /api/v1/hotspots/:id
 * @desc    Update a crime hotspot's risk level or count
 * @access  Private (Police_Officer)
 */
router.patch('/:id', (0, validate_middleware_1.validate)(hotspot_validation_1.updateHotspotSchema), hotspotController.updateHotspot);
/**
 * @route   DELETE /api/v1/hotspots/:id
 * @desc    Delete a crime hotspot
 * @access  Private (Police_Officer)
 */
router.delete('/:id', hotspotController.deleteHotspot);
exports.default = router;
