import type { AppLogger } from './app-logger.js';
import { ConsoleAppLogger } from './console-app-logger.js';

export function createConsoleAppLogger(): AppLogger {
  return new ConsoleAppLogger();
}
