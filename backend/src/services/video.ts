import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');
const FFMPEG_PATH = process.env.FFMPEG_PATH;

if (FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

export interface VideoTranscodeOptions {
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp4' | 'webm';
}

export const transcodeVideo = async (
  inputPath: string,
  outputFilename: string,
  options: VideoTranscodeOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const { quality = 'medium', format = 'mp4' } = options;
    const outputPath = path.join(VIDEO_DIR, outputFilename);

    // Quality presets
    const qualityPresets: { [key: string]: { videoBitrate: string; audioBitrate: string } } = {
      low: { videoBitrate: '500k', audioBitrate: '64k' },
      medium: { videoBitrate: '1500k', audioBitrate: '128k' },
      high: { videoBitrate: '3000k', audioBitrate: '192k' },
    };

    const preset = qualityPresets[quality];

    let command = ffmpeg(inputPath)
      .videoBitrate(preset.videoBitrate)
      .audioBitrate(preset.audioBitrate)
      .format(format)
      .on('start', (commandLine) => {
        console.log('FFmpeg started:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + progress.percent + '% done');
      })
      .on('end', () => {
        console.log('Transcoding finished');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Transcoding error:', err);
        reject(err);
      });

    // Add format-specific options
    if (format === 'mp4') {
      command = command.videoCodec('libx264').audioCodec('aac');
    } else if (format === 'webm') {
      command = command.videoCodec('libvpx-vp9').audioCodec('libopus');
    }

    command.save(outputPath);
  });
};

export const getVideoInfo = async (videoPath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        bitrate: metadata.format.bit_rate,
        video: metadata.streams.find((s) => s.codec_type === 'video'),
        audio: metadata.streams.find((s) => s.codec_type === 'audio'),
      });
    });
  });
};

export const generateThumbnail = async (
  videoPath: string,
  outputFilename: string,
  timeOffset: number = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const thumbnailDir = path.join(UPLOAD_DIR, 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    const outputPath = path.join(thumbnailDir, outputFilename);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeOffset],
        filename: outputFilename,
        folder: thumbnailDir,
        size: '640x360',
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};


