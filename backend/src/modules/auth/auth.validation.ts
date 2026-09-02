import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    address: z.string().optional(),
    nid_number: z.string().optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});
