import { createConsoleAppLogger, type AppLogger } from '@opspilot/logger';

export function createServiceLogger(): AppLogger {
  return createConsoleAppLogger();
}
