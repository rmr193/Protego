import { z } from 'zod';

export const createCrimeReportSchema = z.object({
  body: z.object({
    crime_type: z.string({ required_error: 'Crime type is required' }).min(2, 'Crime type is required'),
    description: z.string({ required_error: 'Description is required' }).min(3, 'Description must be at least 3 characters'),
    location: z.string({ required_error: 'Location is required' }).min(2, 'Please specify an incident location'),
    date_time: z.string().optional().default(() => new Date().toISOString())
  })
});

export const updateCrimeStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'INVESTIGATING', 'DISPATCHED', 'RESOLVED', 'CLOSED'])
  })
});
