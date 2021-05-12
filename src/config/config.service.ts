import { Injectable } from '@nestjs/common';
import { ConfigAppProviderType } from './@types/config-app.type';
import { ConfigEnvType } from './@types/config-env.type';

@Injectable()
export class ConfigService {
  get(): ConfigAppProviderType {
    const { JWT_SECRET_KEY, JWT_EXPIRES, OPS_KEY, ORIGIN, PORT } =
      process.env as ConfigEnvType;
    return {
      jwt: {
        secretKey: JWT_SECRET_KEY || 'FluentSearch.BFF.DB.Password',
        expires: JWT_EXPIRES || '3600s',
      },
      opsKey: OPS_KEY || 'FluentSearch.BFF.OpsKey',
      node_env:
        (process.env.NODE_ENV as ConfigAppProviderType['node_env']) ||
        'development',
      origin: new RegExp(ORIGIN),
      port: Number(PORT || 5000),
    };
  }
}
