import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import FFmpeg from 'fluent-ffmpeg';
import {
  FileDocument,
  FILES_SCHEMA_NAME,
  InsightSchema,
} from 'fluentsearch-types';
import fs from 'fs';
import { Model } from 'mongoose';
import { MinioService } from 'nestjs-minio-client';
import path, { join } from 'path';
import chunkArray from '../utils/chunkArray';

const MAX_THREADS = 5;
const SECOUND_FACTOR = 1000;
const CHUNK = 30;
// const EXTRACT_RESOLUTION = '1920x1080';
const EXTRACT_RESOLUTION = '1280x720';
export const EXTRACT_RESOLUTION_SCHEMA: InsightSchema['extractSize'] = {
  width: 1280,
  height: 720,
};

const TMP_DIR = 'tmp-app';
export const TMP_DIR_PATH = path.resolve(TMP_DIR);

@Injectable()
export class VideoService {
  constructor(
    private readonly minioClient: MinioService,
    @InjectModel(FILES_SCHEMA_NAME)
    private readonly fileModel: Model<FileDocument>,
  ) {}

  async clearTmpFile() {
    const ls = (await fs.promises.readdir(TMP_DIR_PATH)).filter(
      (file) => file != '.gitkeep',
    );
    for (const pathFile of ls) {
      await fs.promises.unlink(join(TMP_DIR_PATH, pathFile));
    }
    return;
  }

  async downloadVideoToServer(fileId: string) {
    const fileDocument = await this.fileModel.findById(fileId);
    if (!fileDocument) throw new BadRequestException('file _id is not exist');
    const filename = fileDocument?.original_filename;
    const owner = fileDocument?.owner;

    await this.minioClient.client.fGetObject(
      owner,
      `${fileDocument._id}-${fileDocument.original_filename}`,
      join(TMP_DIR_PATH, fileDocument.original_filename),
    );
    const absolutePath = join(TMP_DIR_PATH, filename);
    return absolutePath;
  }

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
        TMP_DIR_PATH,
      );
    });
  }

  // FIXME: bind to minio client
  async videoToFrames(filePath: string) {
    Logger.log('process...');
    Logger.log('tmp://', TMP_DIR_PATH);
    const videoInfo = await this.getVideoMeta(filePath);
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
        task.map((t) => this.extractVideo(t.start, t.stop, filePath)),
      );
    }

    Logger.log('finish');
  }
}
