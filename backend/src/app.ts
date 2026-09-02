import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './shared/middlewares/error.middleware';
import { AppError } from './shared/utils/AppError';
import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/users/user.route';
import policeRoutes from './modules/police/police.route';
import gdRoutes from './modules/gd/gd.route';
import crimeRoutes from './modules/crime/crime.route';
import evidenceRoutes from './modules/evidence/evidence.route';
import sosRoutes from './modules/sos/sos.route';
import notificationRoutes from './modules/notification/notification.route';
import caseRoutes from './modules/case/case.route';
import hotspotRoutes from './modules/hotspot/hotspot.route';
import analyticsRoutes from './modules/analytics/analytics.route';
import aiRoutes from './modules/ai/ai.route';

const app: Application = express();

// 1. GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
app.use(cors());

import path from 'path';

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiter: Limit requests from same API
const limiter = rateLimit({
  max: 2000,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// 2. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/police', policeRoutes);
app.use('/api/v1/gd', gdRoutes);
app.use('/api/v1/crimes', crimeRoutes);
app.use('/api/v1/evidence', evidenceRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/hotspots', hotspotRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Protego API is running' });
});

// Handle unhandled routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 3. GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
