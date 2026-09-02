import { EvidenceRepository } from './evidence.repository';
import { AppError } from '../../shared/utils/AppError';
import fs from 'fs';
import path from 'path';

import { uploadToCloudinary } from '../../shared/services/cloudinary.service';
import { logger } from '../../shared/utils/logger';

export class EvidenceService {
  private evidenceRepository: EvidenceRepository;

  constructor() {
    this.evidenceRepository = new EvidenceRepository();
  }

  async uploadEvidence(userId: string, role: string, reportId: string, file: Express.Multer.File) {
    const reportOwner = await this.evidenceRepository.findCrimeReportOwner(reportId);
    if (!reportOwner) {
      throw new AppError('Crime Report not found', 404);
    }

    // Only the creator or Admin/Police can upload evidence
    if (role === 'CITIZEN' && reportOwner.user_id !== userId) {
      throw new AppError('You do not have permission to upload evidence for this report', 403);
    }

    let fileUrl = '';
    if (file.buffer) {
      try {
        const resourceType = file.mimetype.startsWith('video/')
          ? 'video'
          : file.mimetype === 'application/pdf'
          ? 'raw'
          : 'image';
        const uploadRes = await uploadToCloudinary(file.buffer, 'protego/evidence', resourceType);
        fileUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        logger.warn('Cloudinary evidence upload failed, falling back to local storage:', cloudErr);
        const uploadDir = path.join(__dirname, '../../../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = `evidence-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
        fileUrl = `/uploads/${filename}`;
      }
    } else {
      fileUrl = `/uploads/${file.filename}`;
    }
    
    return this.evidenceRepository.uploadEvidence({
      report_id: reportId,
      file_type: file.mimetype,
      file_url: fileUrl
    });
  }

  async getEvidenceByReportId(reportId: string, userId: string, role: string) {
    const reportOwner = await this.evidenceRepository.findCrimeReportOwner(reportId);
    if (!reportOwner) throw new AppError('Crime Report not found', 404);

    if (role === 'CITIZEN' && reportOwner.user_id !== userId) {
      throw new AppError('You do not have permission to view evidence for this report', 403);
    }

    return this.evidenceRepository.getEvidenceByReportId(reportId);
  }

  async deleteEvidence(evidenceId: string, userId: string, role: string) {
    const evidence = await this.evidenceRepository.getEvidenceById(evidenceId);
    if (!evidence) throw new AppError('Evidence not found', 404);

    if (role === 'CITIZEN' && evidence.crime_report.user_id !== userId) {
      throw new AppError('You do not have permission to delete this evidence', 403);
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '../../../', evidence.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.evidenceRepository.deleteEvidence(evidenceId);
  }
}
