"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCrimeStatusSchema = exports.createCrimeReportSchema = void 0;
const zod_1 = require("zod");
exports.createCrimeReportSchema = zod_1.z.object({
    body: zod_1.z.object({
        crime_type: zod_1.z.string().min(2),
        description: zod_1.z.string().min(5),
        location: zod_1.z.string().min(2),
        date_time: zod_1.z.string()
    })
});
exports.updateCrimeStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'INVESTIGATING', 'DISPATCHED', 'RESOLVED', 'CLOSED'])
    })
});
