import multer from 'multer';
import { AppError } from '../utils/AppError';
import { Request } from 'express';

// Use in-memory storage so files can be streamed to Cloudinary or disk on serverless
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Accept images, pdfs, and basic video formats
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'video/mp4'
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, WEBP, GIF, PDF, and MP4 are allowed.', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
