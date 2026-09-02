import { z } from 'zod';

export const addHotspotSchema = z.object({
  body: z.object({
    location: z.string().min(3, 'Location is required'),
    crime_count: z.number().min(0, 'Crime count cannot be negative'),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  })
});

export const updateHotspotSchema = z.object({
  body: z.object({
    crime_count: z.number().min(0).optional(),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
  }).strict()
});
