import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import type { ServiceRuntime } from '../runtime/service-runtime.js';
type ShutdownSignal = 'SIGINT' | 'SIGTERM';

const SHUTDOWN_SIGNALS: ShutdownSignal[] = ['SIGINT', 'SIGTERM'];

export function registerProcessSignalHandlers(
  runtime: ServiceRuntime,
  config: AppConfig,
  logger: AppLogger,
): void {
  for (const signalName of SHUTDOWN_SIGNALS) {
    process.once(signalName, () => {
      void runtime.shutdown(signalName).catch((error: Error) => {
        logger.error('Graceful shutdown failed', {
          serviceName: config.serviceName,
          operationName: 'shutdown',
          signalName,
          errorMessage: error.message,
        });

        process.exitCode = 1;
      });
    });
  }
}
