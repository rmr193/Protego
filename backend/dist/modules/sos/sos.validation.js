"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSOSSchema = void 0;
const zod_1 = require("zod");
exports.triggerSOSSchema = zod_1.z.object({
    body: zod_1.z.object({
        live_location: zod_1.z.string().min(5, 'Valid location coordinates required'),
        emergency_type: zod_1.z.string().min(3, 'Emergency type required')
    })
});
