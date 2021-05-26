import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { InsightModule } from './insight/insight.module';
import { VideoModule } from './video/video.module';
import { TMP_DIR_PATH } from './video/video.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: TMP_DIR_PATH,
      serveRoot: '/file',
    }),
    ConfigModule,
    VideoModule,
    InsightModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
