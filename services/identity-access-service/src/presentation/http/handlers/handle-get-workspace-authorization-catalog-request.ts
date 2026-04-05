import type { ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { GetWorkspaceAuthorizationCatalogUseCase } from '../../../application/use-cases/get-workspace-authorization-catalog.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleGetWorkspaceAuthorizationCatalogRequest(
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: GetWorkspaceAuthorizationCatalogUseCase,
): Promise<void> {
  const catalog = await useCase.execute();

  logger.info('Retrieved workspace authorization catalog', {
    correlationId,
    operationName: 'handleGetWorkspaceAuthorizationCatalogRequest',
    httpStatusCode: 200,
    httpPath: '/authorization/workspace-catalog',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly catalog: typeof catalog }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        catalog,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
