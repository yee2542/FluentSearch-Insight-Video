import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [ConfigModule, VideoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
