import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { InsightInitService } from './insight.init.service';
import { InsightService } from './insight.service';

const InsightEndpoint = HttpModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    timeout: 3000 * 1000,
    maxRedirects: 5,
    baseURL: configService.get().ml_endpoint,
    responseType: 'json',
  }),
});
@Module({
  imports: [ConfigModule, InsightEndpoint],
  providers: [InsightInitService, InsightService],
  exports: [HttpModule.register({}), InsightService, InsightEndpoint],
})
export class InsightModule {}
