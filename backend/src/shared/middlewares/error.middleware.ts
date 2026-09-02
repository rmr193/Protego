import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`[${req.method}] ${req.originalUrl} >> StatusCode:: ${err.statusCode}, Message:: ${err.message}`);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production / General Mode
    if (err.isOperational || (err.statusCode && err.statusCode < 500)) {
      res.status(err.statusCode).json({
        status: err.status || 'fail',
        message: err.message
      });
    } else {
      logger.error('ERROR 💥', err);
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    }
  }
};
