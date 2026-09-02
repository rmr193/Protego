import prisma from '../../core/prisma';

export class AIRepository {
  async saveAnalysis(data: { report_id: string; fake_probability: number; is_fake: boolean; severity_score: number; category: string }) {
    const payload = {
      report_id: data.report_id,
      severity_score: data.severity_score,
      is_fake: data.is_fake,
      analysis_data: {
        fake_probability: data.fake_probability,
        category: data.category
      }
    };

    const existing = await prisma.aIAnalysis.findUnique({
      where: { report_id: data.report_id }
    });

    if (existing) {
      return prisma.aIAnalysis.update({
        where: { analysis_id: existing.analysis_id },
        data: payload
      });
    }

    return prisma.aIAnalysis.create({ data: payload });
  }

  async getAnalysisByReportId(reportId: string) {
    return prisma.aIAnalysis.findUnique({
      where: { report_id: reportId }
    });
  }
}
