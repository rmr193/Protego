import prisma from '../../core/prisma';

export class AnalyticsService {
  
  async getDashboardStats() {
    const [
      totalUsers,
      totalCrimes,
      totalGDs,
      totalCases,
      activeSOS,
      crimesByStatus,
      crimesByType
    ] = await Promise.all([
      prisma.user.count(),
      prisma.crimeReport.count(),
      prisma.generalDiary.count(),
      prisma.case.count(),
      prisma.sOSAlert.count({ where: { status: 'ACTIVE' } }),
      
      // Grouping crimes by status
      prisma.crimeReport.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Grouping crimes by type
      prisma.crimeReport.groupBy({
        by: ['crime_type'],
        _count: { crime_type: true }
      })
    ]);

    // Format groupBy results
    const statusFormatted = (crimesByStatus as any[]).reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {} as Record<string, number>);

    const typeFormatted = (crimesByType as any[]).reduce((acc: Record<string, number>, curr: any) => {
      acc[curr.crime_type] = curr._count.crime_type;
      return acc;
    }, {} as Record<string, number>);

    return {
      overview: {
        total_users: totalUsers,
        total_crimes: totalCrimes,
        total_gds: totalGDs,
        total_cases: totalCases,
        active_sos_alerts: activeSOS
      },
      charts: {
        crimes_by_status: statusFormatted,
        crimes_by_type: typeFormatted
      }
    };
  }
}
