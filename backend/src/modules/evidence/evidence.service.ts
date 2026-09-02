import { EvidenceRepository } from './evidence.repository';
import { AppError } from '../../shared/utils/AppError';
import fs from 'fs';
import path from 'path';

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

    const fileUrl = `/uploads/${file.filename}`;
    
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
