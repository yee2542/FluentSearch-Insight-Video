import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import amqplib from 'amqplib';
import { TaskDTO, WORKER_VIDEO_INSIGHT_QUEUE } from 'fluentsearch-types';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    const config = this.configService.get().rabbitmq;
    const connectionString = `amqp://${config.username}:${config.password}@${config.endpoint}:5672`;
    const mq = await amqplib.connect(connectionString);
    const channel = await mq.createChannel();
    channel.prefetch(1);

    // channel.consume(
    //   WORKER_VIDEO_INSIGHT_QUEUE,
    //   async (msg) => {
    //     const payload = JSON.parse(msg?.content.toString() || '') as TaskDTO;
    //     if (!payload) throw Error('Bad queue parsing');
    //     Logger.verbose(payload, 'WORKER_INSIGHT_QUEUE');
    //   },
    //   { noAck: false },
    // );
  }
  getHello(): string {
    return 'Hello World!';
  }
}
