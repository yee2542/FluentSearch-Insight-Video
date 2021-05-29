import { Module } from '@nestjs/common';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { VideoService } from './video.service';

const MinioInstance = MinioModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    endPoint: config.get().minio.endpoint,
    accessKey: config.get().minio.access_key,
    secretKey: config.get().minio.secret_key,
    port: config.get().minio.port,
    useSSL: config.get().minio.ssl,
  }),
});

@Module({
  imports: [ConfigModule, MinioInstance],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
