import { Controller, Get, Logger } from '@nestjs/common';
import path from 'path';
import { AppService } from './app.service';
import { VideoService } from './video/video.service';

const VIDEO_PATH = path.resolve('sample/sample-2.mp4');

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly videoService: VideoService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/insight')
  async getVideoInsight() {
    Logger.log('consume:// ', VIDEO_PATH);
    await this.videoService.videoToFrames(VIDEO_PATH);
    return;
  }
}
