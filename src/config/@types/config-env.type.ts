export enum ConfigEnvEnum {
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  JWT_EXPIRES = 'JWT_EXPIRES',
  OPS_KEY = 'OPS_KEY',
  ORIGIN = 'ORIGIN',
  PORT = 'PORT',
}

export type ConfigEnvType = {
  [key in ConfigEnvEnum]: string;
};
