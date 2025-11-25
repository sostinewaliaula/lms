import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';

const router = Router();

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';

// Serve media files
router.get('/:type/:filename', authenticate, (req, res) => {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['videos', 'documents', 'thumbnails', 'avatars', 'certificates'];

    if (!allowedTypes.includes(type)) {
      res.status(400).json({ error: 'Invalid media type' });
      return;
    }

    const filePath = path.join(UPLOAD_DIR, type, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Set appropriate headers
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // For videos, support range requests for streaming
    if (type === 'videos') {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': contentType,
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      res.sendFile(path.resolve(filePath));
    }
  } catch (error) {
    console.error('Serve media error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

