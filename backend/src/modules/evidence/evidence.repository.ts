import prisma from '../../core/prisma';

export class EvidenceRepository {
  async uploadEvidence(data: { report_id: string; file_type: string; file_url: string }) {
    return prisma.evidence.create({ data });
  }

  async getEvidenceByReportId(reportId: string) {
    return prisma.evidence.findMany({
      where: { report_id: reportId }
    });
  }

  async getEvidenceById(evidenceId: string) {
    return prisma.evidence.findUnique({
      where: { evidence_id: evidenceId },
      include: { crime_report: true }
    });
  }

  async deleteEvidence(evidenceId: string) {
    return prisma.evidence.delete({
      where: { evidence_id: evidenceId }
    });
  }

  // To check permissions
  async findCrimeReportOwner(reportId: string) {
    return prisma.crimeReport.findUnique({
      where: { report_id: reportId },
      select: { user_id: true }
    });
  }
}
