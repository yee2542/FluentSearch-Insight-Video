import { HttpService, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeepDetectRequestAPI,
  DeepDetectResponseAPI,
  FileTypeEnum,
  InsightSchema,
  INSIGHT_SCHEMA_NAME,
  LanguageEnum,
  ModelEnum,
} from 'fluentsearch-types';
import { promises } from 'fs';
import { Model } from 'mongoose';
import { ConfigService } from '../config/config.service';
import chunkArray from '../utils/chunkArray';
import {
  EXTRACT_RESOLUTION_SCHEMA,
  TMP_DIR_PATH,
} from '../video/video.service';

const MAX_INSGHT_ML_THREADS = 3;
const MODEL_SERVICE_NAME = ModelEnum.detection_600;
@Injectable()
export class InsightService {
  constructor(
    private deepDetectEndpoint: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(INSIGHT_SCHEMA_NAME)
    private readonly insightModel: Model<InsightSchema>,
  ) {}

  private async readDirQueue(dir: string) {
    return (await promises.readdir(dir, 'utf8')).filter((el) =>
      el.includes('.jpg'),
    );
  }

  private async endpointBuilder<T>(filePath: string) {
    const payload: DeepDetectRequestAPI = {
      service: MODEL_SERVICE_NAME,
      parameters: {
        output: {
          confidence_threshold: 0.2,
          bbox: true,
        },
        mllib: {
          gpu: false,
        },
      },
      data: [
        // `http://${FLUENT_SEARCH_VIDEO_INSIGHT_HOSTNAME}:${FLUENT_SEARCH_VIDEO_INSIGHT_PORT}/file/${filePath}`,
        `${this.configService.get().tmp_video_server}/file/${filePath}`,
      ],
    };

    return this.deepDetectEndpoint.post<T>('/predict', payload).toPromise();
  }

  async sendToInsight(owner: string, fileType: FileTypeEnum, fileId: string) {
    const queue = (await this.readDirQueue(TMP_DIR_PATH)).map((el, i) => ({
      i,
      filePath: el,
    }));

    const groupQueue = chunkArray(queue, MAX_INSGHT_ML_THREADS);

    for (const task of groupQueue) {
      const responses = await Promise.all(
        task.map((t) =>
          this.endpointBuilder<DeepDetectResponseAPI>(t.filePath),
        ),
      );

      for (const r of responses) {
        Logger.verbose(r.data);
        const filename = r.data.body.predictions[0].uri;
        if (!filename) throw Error('bad file name');
        else {
          const fpsNth = filename?.match(/\/extract-(\d*).jpg/);
          const cats = r?.data.body.predictions[0].classes;
          for (const cat of cats) {
            // write results
            await this.insightModel.create({
              result: {
                prob: cat.prob,
                bbox: cat.bbox,
                cat: cat.cat,
              },
              keyword: cat.cat,
              owner,

              model: MODEL_SERVICE_NAME,
              bbox: cat.bbox,
              prob: cat.prob,
              lang: LanguageEnum.enus,
              fileId,
              fileType,
              fps: fpsNth ? Number(fpsNth[1]) : -1,
              extractSize: EXTRACT_RESOLUTION_SCHEMA,
            });
          }
        }
      }
    }
  }
}
