import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB default

// Ensure upload directories exist
const ensureDirectories = () => {
  const dirs = [
    UPLOAD_DIR,
    path.join(UPLOAD_DIR, 'videos'),
    path.join(UPLOAD_DIR, 'documents'),
    path.join(UPLOAD_DIR, 'thumbnails'),
    path.join(UPLOAD_DIR, 'avatars'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = UPLOAD_DIR;

    if (file.fieldname === 'video') {
      uploadPath = path.join(UPLOAD_DIR, 'videos');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(UPLOAD_DIR, 'documents');
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = path.join(UPLOAD_DIR, 'thumbnails');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(UPLOAD_DIR, 'avatars');
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes: { [key: string]: string[] } = {
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    thumbnail: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  };

  const fieldMimes = allowedMimes[file.fieldname] || [];
  
  if (fieldMimes.length === 0 || fieldMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldMimes.join(', ')}`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

// Helper to get file URL
export const getFileUrl = (filename: string, type: 'video' | 'document' | 'thumbnail' | 'avatar'): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  const folder = type === 'video' ? 'videos' : type === 'document' ? 'documents' : type === 'thumbnail' ? 'thumbnails' : 'avatars';
  return `${baseUrl}/api/media/${folder}/${filename}`;
};


