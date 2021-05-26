import { HttpModule, Module } from '@nestjs/common';
import { InsightService } from './insight.service';

const MODEL_SERVICE_ENDPOINT = 'deepdetect:8080';
@Module({
  imports: [
    HttpModule.register({
      baseURL: `http://${MODEL_SERVICE_ENDPOINT}`,
    }),
  ],
  providers: [InsightService],
  exports: [HttpModule.register({}), InsightService],
})
export class InsightModule {}
