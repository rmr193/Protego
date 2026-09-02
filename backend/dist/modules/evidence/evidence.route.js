"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evidence_controller_1 = require("./evidence.controller");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const upload_middleware_1 = require("../../shared/middlewares/upload.middleware");
const router = (0, express_1.Router)();
const evidenceController = new evidence_controller_1.EvidenceController();
// Protect all evidence routes
router.use(auth_middleware_1.authenticate);
/**
 * @route   POST /api/v1/evidence/:reportId
 * @desc    Upload evidence for a specific Crime Report
 * @access  Private (Report owner or Police)
 */
router.post('/:reportId', upload_middleware_1.upload.single('file'), evidenceController.uploadEvidence);
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
exports.default = router;
