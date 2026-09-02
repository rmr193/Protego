"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReportSchema = void 0;
const zod_1 = require("zod");
exports.analyzeReportSchema = zod_1.z.object({
    body: zod_1.z.object({
        report_id: zod_1.z.string().uuid(),
        description: zod_1.z.string().min(10)
    })
});
