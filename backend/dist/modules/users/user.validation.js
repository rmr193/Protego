"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        full_name: zod_1.z.string().min(3, 'Full name must be at least 3 characters').optional(),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters').optional(),
        address: zod_1.z.string().optional(),
        nid_number: zod_1.z.string().optional(),
    }).strict() // Reject unknown fields
});
