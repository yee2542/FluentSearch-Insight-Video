import { Controller, Get, Logger } from '@nestjs/common';
import path from 'path';
import { AppService } from './app.service';
import { InsightService } from './insight/insight.service';
import { VideoService } from './video/video.service';

const VIDEO_PATH = path.resolve('sample/sample.mp4');

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly videoService: VideoService,
    private readonly insightService: InsightService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('/insight')
  // async getVideoInsight() {
  //   Logger.log('consume:// ', VIDEO_PATH);
  //   await this.videoService.videoToFrames(VIDEO_PATH);
  //   await this.insightService.sendToInsight();
  //   return;
  // }
}
