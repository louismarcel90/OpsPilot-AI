import type { Server } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

export function startHttpServer(
  server: Server,
  config: AppConfig,
  logger: AppLogger,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    server.once('error', (error: Error) => {
      reject(error);
    });

    server.listen(config.port, () => {
      logger.info('HTTP server started', {
        serviceName: config.serviceName,
        operationName: 'startHttpServer',
      });

      resolve();
    });
  });
}
