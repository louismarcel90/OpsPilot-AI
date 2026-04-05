import { createAppConfig } from '@opspilot/config';
import { createPostgresConnection } from '@opspilot/db';

import { DrizzleTenantReadRepository } from './infrastructure/db/repositories/drizzle-tenant-read-repository.js';
import { DrizzleUserReadRepository } from './infrastructure/db/repositories/drizzle-user-read-repository.js';
import { DrizzleWorkspaceMembershipReadRepository } from './infrastructure/db/repositories/drizzle-workspace-membership-read-repository.js';
import { DrizzleWorkspaceReadRepository } from './infrastructure/db/repositories/drizzle-workspace-read-repository.js';
import { createHttpServer } from './infrastructure/http/server/create-http-server.js';
import { registerProcessSignalHandlers } from './infrastructure/http/server/register-process-signal-handlers.js';
import { createServiceDependencies } from './infrastructure/http/runtime/service-dependencies.js';
import { IdentityAccessServiceRuntime } from './infrastructure/http/runtime/service-runtime.js';
import { createServiceLogger } from './infrastructure/logging/create-service-logger.js';

async function bootstrap(): Promise<void> {
  const config = createAppConfig({
    SERVICE_NAME: 'identity-access-service',
    NODE_ENV: process.env['NODE_ENV'] ?? 'development',
    PORT: process.env['PORT'] ?? '3001',
    LOG_LEVEL: process.env['LOG_LEVEL'] ?? 'info',
    ...(process.env['DATABASE_URL'] !== undefined
      ? { DATABASE_URL: process.env['DATABASE_URL'] }
      : {}),
  });

  const logger = createServiceLogger();

  logger.info('Bootstrapping service', {
    serviceName: config.serviceName,
    operationName: 'bootstrap',
  });

  const databaseConnection = createPostgresConnection(config.database);

  const userReadRepository = new DrizzleUserReadRepository(databaseConnection);
  const tenantReadRepository = new DrizzleTenantReadRepository(databaseConnection);
  const workspaceReadRepository = new DrizzleWorkspaceReadRepository(databaseConnection);
  const workspaceMembershipReadRepository = new DrizzleWorkspaceMembershipReadRepository(
    databaseConnection,
  );

  const dependencies = createServiceDependencies(
    userReadRepository,
    tenantReadRepository,
    workspaceReadRepository,
    workspaceMembershipReadRepository,
  );

  const server = createHttpServer(config, logger, databaseConnection, dependencies);
  const runtime = new IdentityAccessServiceRuntime(server, databaseConnection, config, logger);

  registerProcessSignalHandlers(runtime, config, logger);

  await runtime.start();
}

void bootstrap().catch((error: Error) => {
  const logger = createServiceLogger();

  logger.error('Service bootstrap failed', {
    serviceName: 'identity-access-service',
    operationName: 'bootstrap',
    errorMessage: error.message,
  });

  process.exitCode = 1;
});
