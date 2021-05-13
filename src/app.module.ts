import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { VideoModule } from './video/video.module';
import { InsightModule } from './insight/insight.module';

@Module({
  imports: [ConfigModule, VideoModule, InsightModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
