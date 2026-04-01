import type { AppLogger } from './app-logger.js';
import type { LogContext } from './log-context.js';
import type { LogLevel } from './log-level.js';

interface ConsoleLogEntry {
  readonly timestampIso: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: LogContext;
}

export class ConsoleAppLogger implements AppLogger {
  public debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.write('error', message, context);
  }

  private write(level: LogLevel, message: string, context?: LogContext): void {
    const entry: ConsoleLogEntry = {
      timestampIso: new Date().toISOString(),
      level,
      message,
      ...(context !== undefined ? { context } : {}),
    };

    const serializedEntry = JSON.stringify(entry);

    switch (level) {
      case 'debug':
      case 'info':
        console.log(serializedEntry);
        break;
      case 'warn':
        console.warn(serializedEntry);
        break;
      case 'error':
        console.error(serializedEntry);
        break;
    }
  }
}
