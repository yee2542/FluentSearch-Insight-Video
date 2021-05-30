import { ModelEnum } from 'fluentsearch-types';

export const INIT_ML: { model: ModelEnum; payload: Record<string, any> }[] = [
  {
    model: ModelEnum.detection_600,
    payload: {
      description: 'object detection service',
      model: {
        repository: '/opt/models/detection_600',
        create_repository: true,
        init: 'https://deepdetect.com/models/init/desktop/images/detection/detection_600.tar.gz',
      },
      parameters: { input: { connector: 'image' } },
      mllib: 'caffe',
      type: 'supervised',
    },
  },
];
