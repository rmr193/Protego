import { AnalyticsService } from './analytics.service';
import prisma from '../../core/prisma';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
  });

  describe('getDashboardStats', () => {
    it('should aggregate and return dashboard metrics', async () => {
      jest.spyOn(prisma.user, 'count').mockResolvedValue(100 as any);
      jest.spyOn(prisma.crimeReport, 'count').mockResolvedValue(50 as any);
      jest.spyOn(prisma.generalDiary, 'count').mockResolvedValue(30 as any);
      jest.spyOn(prisma.case, 'count').mockResolvedValue(20 as any);
      jest.spyOn(prisma.sOSAlert, 'count').mockResolvedValue(5 as any);

      jest.spyOn(prisma.crimeReport, 'groupBy')
        .mockResolvedValueOnce([{ status: 'PENDING', _count: { status: 10 } }] as any)
        .mockResolvedValueOnce([{ crime_type: 'Theft', _count: { crime_type: 5 } }] as any);

      const result = await analyticsService.getDashboardStats();
      
      expect(result.overview.total_users).toBe(100);
      expect(result.overview.active_sos_alerts).toBe(5);
      expect(result.charts.crimes_by_status['PENDING']).toBe(10);
      expect(result.charts.crimes_by_type['Theft']).toBe(5);
    });
  });
});
