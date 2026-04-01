import { z } from 'zod';

import type { AppConfig } from './app-config.js';
import { NODE_ENV_VALUES } from './node-env.js';

const appEnvironmentSchema = z.object({
  SERVICE_NAME: z.string().trim().min(1),
  NODE_ENV: z.enum(NODE_ENV_VALUES).default('development'),
  PORT: z
    .string()
    .trim()
    .regex(/^\d+$/)
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0 && value <= 65535, {
      message: 'PORT must be a valid TCP port',
    })
    .default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

interface EnvironmentSource {
  readonly SERVICE_NAME?: string;
  readonly NODE_ENV?: string;
  readonly PORT?: string;
  readonly LOG_LEVEL?: string;
}

export function createAppConfig(environment: EnvironmentSource = process.env): AppConfig {
  const parsedEnvironment = appEnvironmentSchema.parse(environment);

  return {
    serviceName: parsedEnvironment.SERVICE_NAME,
    nodeEnv: parsedEnvironment.NODE_ENV,
    port: parsedEnvironment.PORT,
    logLevel: parsedEnvironment.LOG_LEVEL,
  };
}
