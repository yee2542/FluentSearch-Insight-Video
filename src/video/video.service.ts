import { Injectable } from '@nestjs/common';
import * as FFmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as stream from 'stream';

@Injectable()
export class VideoService {
  async videoToFrames(inputStream: stream.Readable) {
    // const command = FFmpeg({ source: inputStream, timeout: 120 })
    const command = FFmpeg({
      source: path.join(__dirname, '../../sample/sample.mp4'),
      timeout: 120,
    })
      .withVideoFilters(['fps', 'fps=15', `round=up`])
      .withSize('1280x720')
      .output(`%s-%%04d.jpg%(input_file_name[:-4])`, {
        end: true,
      });
  }
}
