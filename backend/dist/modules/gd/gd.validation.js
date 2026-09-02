"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGDStatusSchema = exports.createGDSchema = void 0;
const zod_1 = require("zod");
exports.createGDSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
        description: zod_1.z.string().min(20, 'Description must be at least 20 characters')
    })
});
exports.updateGDStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED'])
    })
});
