import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/AppError';
import { Request } from 'express';

import fs from 'fs';
import os from 'os';

const getUploadDir = () => {
  if (process.env.VERCEL) {
    return os.tmpdir();
  }
  const uploadPath = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, getUploadDir());
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Accept images, pdfs, and basic video formats
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, PDF, and MP4 are allowed.', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
