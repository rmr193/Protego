import { z } from 'zod';

export const triggerSOSSchema = z.object({
  body: z.object({
    live_location: z.string().min(5, 'Valid location coordinates required'),
    emergency_type: z.string().min(3, 'Emergency type required')
  })
});
