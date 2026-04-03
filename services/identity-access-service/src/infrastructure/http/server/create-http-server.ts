import { createServer, type Server } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';
import type { PostgresConnection } from '@opspilot/db';

import { createRouter } from '../routes/create-router.js';

export function createHttpServer(
  config: AppConfig,
  logger: AppLogger,
  connection: PostgresConnection,
): Server {
  return createServer(createRouter(config, logger, connection));
}
