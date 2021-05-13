import { Injectable, Logger } from '@nestjs/common';
import * as FFmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import chunkArray from 'src/utils/chunkArray';

const MAX_THREADS = 5;
const SECOUND_FACTOR = 1000;
const CHUNK = 30;
const EXTRACT_RESOLUTION = '1280x720';

const VIDEO_PATH = path.join(__dirname, '../../../sample/sample-2.mp4');

const TMP_DIR = '/tmp';
const TMP_DIR_PATH = path.resolve(TMP_DIR);

@Injectable()
export class VideoService {
  private async getVideoMeta(path: string) {
    return new Promise<FFmpeg.FfprobeData>((resolve, reject) => {
      FFmpeg.ffprobe(path, function (err, metadata) {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
  }

  private async extractVideo(start: number, stop: number, path: string) {
    return new Promise((resolve, reject) => {
      const timemarks = Array(CHUNK)
        .fill(0)
        .map((_, i) => start + i)
        .map((el) => new Date(el * SECOUND_FACTOR).toISOString().substr(11, 8));

      FFmpeg(path).on('error', reject).on('end', resolve).takeScreenshots(
        {
          filename: `extract-%s.jpg`,
          timemarks,
          size: EXTRACT_RESOLUTION,
          fastSeek: true,
        },
        './extracts/',
      );
    });
  }

  // FIXME: bind to minio client
  async videoToFrames(fileurl: string) {
    Logger.log('process...');
    const videoInfo = await this.getVideoMeta(VIDEO_PATH);
    const { duration } = videoInfo.format;

    if (!duration) throw new Error('unsupported duration format');
    const nOfChunk = Math.round(duration / CHUNK);
    const queue = Array(nOfChunk + 1)
      .fill(0)
      .map((_, i) => i * CHUNK) // split chunk
      .map((el, i, arr) => {
        // map start, stop
        const end = arr[i + 1] === undefined;
        if (!end) return { start: el, stop: arr[i + 1] };
        return { start: el, stop: duration };
      });

    const chunkQueue = chunkArray(queue, MAX_THREADS);

    for (const [i, task] of chunkQueue.entries()) {
      Logger.log(`processing ${i}/${chunkQueue.length}`);

      await Promise.all(
        task.map((t) => this.extractVideo(t.start, t.stop, VIDEO_PATH)),
      );
    }

    Logger.log('finish');
  }
}
