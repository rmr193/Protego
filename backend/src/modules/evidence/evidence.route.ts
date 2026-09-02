import { Router } from 'express';
import { EvidenceController } from './evidence.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { upload } from '../../shared/middlewares/upload.middleware';

const router = Router();
const evidenceController = new EvidenceController();

// Protect all evidence routes
router.use(authenticate);

/**
 * @route   POST /api/v1/evidence/:reportId
 * @desc    Upload evidence for a specific Crime Report
 * @access  Private (Report owner or Police)
 */
router.post('/:reportId', upload.single('file'), evidenceController.uploadEvidence);

/**
 * @route   GET /api/v1/evidence/:reportId
 * @desc    Get all evidence for a specific Crime Report
 * @access  Private
 */
router.get('/:reportId', evidenceController.getEvidenceByReport);

/**
 * @route   DELETE /api/v1/evidence/:id
 * @desc    Delete evidence by its ID
 * @access  Private (Owner or Police)
 */
router.delete('/:id', evidenceController.deleteEvidence);

export default router;
