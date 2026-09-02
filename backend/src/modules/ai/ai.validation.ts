import { z } from 'zod';

export const analyzeReportSchema = z.object({
  body: z.object({
    report_id: z.string().uuid(),
    description: z.string().min(10)
  })
});
