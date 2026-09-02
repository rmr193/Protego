"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOfficerSchema = exports.createOfficerSchema = exports.updateStationSchema = exports.createStationSchema = void 0;
const zod_1 = require("zod");
// Station Schemas
exports.createStationSchema = zod_1.z.object({
    body: zod_1.z.object({
        station_name: zod_1.z.string().min(3),
        location: zod_1.z.string().min(5),
        contact_number: zod_1.z.string().min(10)
    })
});
exports.updateStationSchema = zod_1.z.object({
    body: zod_1.z.object({
        station_name: zod_1.z.string().min(3).optional(),
        location: zod_1.z.string().min(5).optional(),
        contact_number: zod_1.z.string().min(10).optional()
    }).strict()
});
// Officer Schemas
exports.createOfficerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3),
        badge_number: zod_1.z.string().min(3),
        station_id: zod_1.z.string().uuid(),
        rank: zod_1.z.string().min(2),
        contact: zod_1.z.string().min(10)
    })
});
exports.updateOfficerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3).optional(),
        badge_number: zod_1.z.string().min(3).optional(),
        station_id: zod_1.z.string().uuid().optional(),
        rank: zod_1.z.string().min(2).optional(),
        contact: zod_1.z.string().min(10).optional()
    }).strict()
});
