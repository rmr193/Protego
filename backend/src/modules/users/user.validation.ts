import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(3, 'Full name must be at least 3 characters').optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    address: z.string().optional(),
    nid_number: z.string().optional(),
  }).strict() // Reject unknown fields
});
