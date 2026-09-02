import { z } from 'zod';

export const createCaseSchema = z.object({
  body: z.object({
    report_id: z.string().uuid(),
    officer_id: z.string().uuid()
  })
});

export const addTrackingSchema = z.object({
  body: z.object({
    status_update: z.string().min(5, 'Status update must be descriptive enough')
  })
});
