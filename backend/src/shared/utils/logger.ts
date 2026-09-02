import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'development' ? colorize() : winston.format.uncolorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// In non-serverless production, add file transports
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  try {
    logger.add(
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
    );
    logger.add(
      new winston.transports.File({ filename: 'logs/combined.log' })
    );
  } catch (err) {
    // Fallback silently if logs directory is not writable
  }
}

