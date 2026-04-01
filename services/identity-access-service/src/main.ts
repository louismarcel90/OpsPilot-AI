import { createAppConfig } from '@opspilot/config';

import { startHttpServer } from './infrastructure/http/server/start-http-server.js';
import { createServiceLogger } from './infrastructure/logging/create-service-logger.js';

function bootstrap(): void {
  const config = createAppConfig({
    SERVICE_NAME: 'identity-access-service',
    PORT: process.env['PORT'] ?? '3001',
    ...(process.env['NODE_ENV'] !== undefined ? { NODE_ENV: process.env['NODE_ENV'] } : {}),
    ...(process.env['LOG_LEVEL'] !== undefined ? { LOG_LEVEL: process.env['LOG_LEVEL'] } : {}),
  });

  const logger = createServiceLogger();

  logger.info('Bootstrapping service', {
    serviceName: config.serviceName,
    operationName: 'bootstrap',
  });

  startHttpServer(config, logger);
}

bootstrap();
