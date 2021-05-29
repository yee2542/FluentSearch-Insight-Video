import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from './config/config.service';
import amqplib from 'amqplib';
import { TaskDTO, WORKER_VIDEO_INSIGHT_QUEUE } from 'fluentsearch-types';
import { VideoService } from './video/video.service';
import { InsightService } from './insight/insight.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly videoService: VideoService,
    private readonly insightSerivce: InsightService,
  ) {}

  async onModuleInit() {
    const config = this.configService.get().rabbitmq;
    const connectionString = `amqp://${config.username}:${config.password}@${config.endpoint}:5672`;
    const mq = await amqplib.connect(connectionString);
    const channel = await mq.createChannel();
    channel.prefetch(1);

    channel.consume(
      WORKER_VIDEO_INSIGHT_QUEUE,
      async (msg) => {
        const payload = JSON.parse(msg?.content.toString() || '') as TaskDTO;
        if (!payload)
          throw new InternalServerErrorException('Bad queue payload parsing');
        Logger.verbose(payload, 'WORKER_INSIGHT_QUEUE');

        // download video

        const filePath =
          payload.fileId &&
          (await this.videoService.downloadVideoToServer(payload.fileId));
        if (!filePath)
          throw new InternalServerErrorException(
            'file path for precessing is not exist',
          );
        await this.videoService.videoToFrames(filePath);
        await this.insightSerivce.sendToInsight();
        // await this.videoService.clearTmpFile();
        // msg && channel.ack(msg);
      },
      { noAck: false },
    );
  }
  getHello(): string {
    return 'Hello World!';
  }
}
