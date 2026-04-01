import { createServer } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { createRouter } from '../routes/create-router.js';

export function startHttpServer(config: AppConfig, logger: AppLogger): void {
  const server = createServer(createRouter(config, logger));

  server.listen(config.port, () => {
    logger.info('HTTP server started', {
      serviceName: config.serviceName,
      operationName: 'startHttpServer',
    });
  });
}
