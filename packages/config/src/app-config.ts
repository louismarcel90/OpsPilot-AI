import type { DatabaseConfig } from './database-config.js';
import type { NodeEnv } from './node-env.js';

export interface AppConfig {
  readonly serviceName: string;
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error';
  readonly database: DatabaseConfig;
}
