export type ConfigAppProviderType = {
  jwt: {
    secretKey: string;
    expires: string;
  };
  opsKey: string;
  node_env: 'production' | 'development';
  origin: RegExp;
  port: number;
};
