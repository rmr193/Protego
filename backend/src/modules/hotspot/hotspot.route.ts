import { Router } from 'express';
import { HotspotController } from './hotspot.controller';
import { authenticate, restrictTo } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { addHotspotSchema, updateHotspotSchema } from './hotspot.validation';

const router = Router();
const hotspotController = new HotspotController();

// Protect all hotspot routes
router.use(authenticate);

/**
 * @route   GET /api/v1/hotspots
 * @desc    Get all crime hotspots
 * @access  Private (All authenticated users)
 */
router.get('/', hotspotController.getAllHotspots);

// ==========================================
// Police Officer Only Routes
// ==========================================
router.use(restrictTo('POLICE_OFFICER'));

/**
 * @route   POST /api/v1/hotspots
 * @desc    Add a new crime hotspot manually
 * @access  Private (Police_Officer)
 */
router.post('/', validate(addHotspotSchema), hotspotController.addHotspot);

/**
 * @route   PATCH /api/v1/hotspots/:id
 * @desc    Update a crime hotspot's risk level or count
 * @access  Private (Police_Officer)
 */
router.patch('/:id', validate(updateHotspotSchema), hotspotController.updateHotspot);

/**
 * @route   DELETE /api/v1/hotspots/:id
 * @desc    Delete a crime hotspot
 * @access  Private (Police_Officer)
 */
router.delete('/:id', hotspotController.deleteHotspot);

export default router;
