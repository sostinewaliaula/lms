import { Request, Response } from 'express';
import { transcodeVideo, getVideoInfo, generateThumbnail } from '../services/video';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');

export const processVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const inputPath = req.file.path;
    const originalName = path.parse(req.file.originalname).name;
    const outputFilename = `transcoded-${Date.now()}-${originalName}.mp4`;

    // Get video info
    const info = await getVideoInfo(inputPath);
    console.log('Video info:', info);

    // Transcode video
    const transcodedPath = await transcodeVideo(inputPath, outputFilename, {
      quality: 'medium',
      format: 'mp4',
    });

    // Generate thumbnail
    const thumbnailFilename = `thumb-${Date.now()}-${originalName}.jpg`;
    await generateThumbnail(inputPath, thumbnailFilename);

    // Clean up original file if transcoding succeeded
    if (fs.existsSync(transcodedPath)) {
      fs.unlinkSync(inputPath);
    }

    res.json({
      message: 'Video processed successfully',
      video_url: `/api/media/videos/${outputFilename}`,
      thumbnail_url: `/api/media/thumbnails/${thumbnailFilename}`,
      duration: info.duration,
    });
  } catch (error) {
    console.error('Process video error:', error);
    res.status(500).json({ error: 'Video processing failed' });
  }
};

export const getVideoMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(VIDEO_DIR, filename);

    if (!fs.existsSync(videoPath)) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    const info = await getVideoInfo(videoPath);
    res.json({ metadata: info });
  } catch (error) {
    console.error('Get video metadata error:', error);
    res.status(500).json({ error: 'Failed to get video metadata' });
  }
};


