"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        full_name: zod_1.z.string().min(3, 'Full name must be at least 3 characters'),
        email: zod_1.z.string().email('Invalid email format'),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        address: zod_1.z.string().optional(),
        nid_number: zod_1.z.string().optional(),
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required'),
    })
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
    })
});
