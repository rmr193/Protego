import { z } from 'zod';

export const createCrimeReportSchema = z.object({
  body: z.object({
    crime_type: z.string().min(2),
    description: z.string().min(5),
    location: z.string().min(2),
    date_time: z.string()
  })
});

export const updateCrimeStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'INVESTIGATING', 'DISPATCHED', 'RESOLVED', 'CLOSED'])
  })
});

