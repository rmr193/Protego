"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTrackingSchema = exports.createCaseSchema = void 0;
const zod_1 = require("zod");
exports.createCaseSchema = zod_1.z.object({
    body: zod_1.z.object({
        report_id: zod_1.z.string().uuid(),
        officer_id: zod_1.z.string().uuid()
    })
});
exports.addTrackingSchema = zod_1.z.object({
    body: zod_1.z.object({
        status_update: zod_1.z.string().min(5, 'Status update must be descriptive enough')
    })
});
