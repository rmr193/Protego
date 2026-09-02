"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHotspotSchema = exports.addHotspotSchema = void 0;
const zod_1 = require("zod");
exports.addHotspotSchema = zod_1.z.object({
    body: zod_1.z.object({
        location: zod_1.z.string().min(3, 'Location is required'),
        crime_count: zod_1.z.number().min(0, 'Crime count cannot be negative'),
        risk_level: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    })
});
exports.updateHotspotSchema = zod_1.z.object({
    body: zod_1.z.object({
        crime_count: zod_1.z.number().min(0).optional(),
        risk_level: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
    }).strict()
});
