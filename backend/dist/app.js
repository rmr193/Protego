"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const AppError_1 = require("./shared/utils/AppError");
const auth_route_1 = __importDefault(require("./modules/auth/auth.route"));
const user_route_1 = __importDefault(require("./modules/users/user.route"));
const police_route_1 = __importDefault(require("./modules/police/police.route"));
const gd_route_1 = __importDefault(require("./modules/gd/gd.route"));
const crime_route_1 = __importDefault(require("./modules/crime/crime.route"));
const evidence_route_1 = __importDefault(require("./modules/evidence/evidence.route"));
const sos_route_1 = __importDefault(require("./modules/sos/sos.route"));
const notification_route_1 = __importDefault(require("./modules/notification/notification.route"));
const case_route_1 = __importDefault(require("./modules/case/case.route"));
const hotspot_route_1 = __importDefault(require("./modules/hotspot/hotspot.route"));
const analytics_route_1 = __importDefault(require("./modules/analytics/analytics.route"));
const ai_route_1 = __importDefault(require("./modules/ai/ai.route"));
const app = (0, express_1.default)();
// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Enable CORS
app.use((0, cors_1.default)());
const path_1 = __importDefault(require("path"));
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Serve static uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Rate Limiter: Limit requests from same API
const limiter = (0, express_rate_limit_1.default)({
    max: 2000,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);
// 2. ROUTES
app.use('/api/v1/auth', auth_route_1.default);
app.use('/api/v1/users', user_route_1.default);
app.use('/api/v1/police', police_route_1.default);
app.use('/api/v1/gd', gd_route_1.default);
app.use('/api/v1/crimes', crime_route_1.default);
app.use('/api/v1/evidence', evidence_route_1.default);
app.use('/api/v1/sos', sos_route_1.default);
app.use('/api/v1/notifications', notification_route_1.default);
app.use('/api/v1/cases', case_route_1.default);
app.use('/api/v1/hotspots', hotspot_route_1.default);
app.use('/api/v1/analytics', analytics_route_1.default);
app.use('/api/v1/ai', ai_route_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Protego API is running' });
});
// Handle unhandled routes
app.use((req, res, next) => {
    next(new AppError_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 3. GLOBAL ERROR HANDLER
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
