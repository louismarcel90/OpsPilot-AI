import type { Server } from 'node:http';

import type { AppConfig } from '@opspilot/config';
import type { AppLogger } from '@opspilot/logger';

import { startHttpServer } from '../server/start-http-server.js';
import { stopHttpServer } from '../server/stop-http-server.js';

type ShutdownSignal = 'SIGINT' | 'SIGTERM';

export interface ServiceRuntime {
  start(): Promise<void>;
  shutdown(signalName: ShutdownSignal): Promise<void>;
}

export class IdentityAccessServiceRuntime implements ServiceRuntime {
  private isShuttingDown = false;

  public constructor(
    private readonly server: Server,
    private readonly config: AppConfig,
    private readonly logger: AppLogger,
  ) {}

  public async start(): Promise<void> {
    await startHttpServer(this.server, this.config, this.logger);
  }

  public async shutdown(signalName: ShutdownSignal): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    this.logger.warn('Shutdown signal received', {
      serviceName: this.config.serviceName,
      operationName: 'shutdown',
      signalName,
    });

    await stopHttpServer(this.server);

    this.logger.info('HTTP server stopped cleanly', {
      serviceName: this.config.serviceName,
      operationName: 'shutdown',
      signalName,
    });
  }
}
