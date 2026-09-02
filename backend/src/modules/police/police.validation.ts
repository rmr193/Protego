import { z } from 'zod';

// Station Schemas
export const createStationSchema = z.object({
  body: z.object({
    station_name: z.string().min(3),
    location: z.string().min(5),
    contact_number: z.string().min(10)
  })
});

export const updateStationSchema = z.object({
  body: z.object({
    station_name: z.string().min(3).optional(),
    location: z.string().min(5).optional(),
    contact_number: z.string().min(10).optional()
  }).strict()
});

// Officer Schemas
export const createOfficerSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    badge_number: z.string().min(3),
    station_id: z.string().uuid(),
    rank: z.string().min(2),
    contact: z.string().min(10)
  })
});

export const updateOfficerSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    badge_number: z.string().min(3).optional(),
    station_id: z.string().uuid().optional(),
    rank: z.string().min(2).optional(),
    contact: z.string().min(10).optional()
  }).strict()
});
