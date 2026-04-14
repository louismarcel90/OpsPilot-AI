import type { ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ListWorkflowsUseCase } from '../../../application/use-cases/list-workflows.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleListWorkflowsRequest(
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  listWorkflowsUseCase: ListWorkflowsUseCase,
): Promise<void> {
  const workflows = await listWorkflowsUseCase.execute();

  logger.info('Retrieved workflows', {
    correlationId,
    operationName: 'handleListWorkflowsRequest',
    httpStatusCode: 200,
    httpPath: '/workflows',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly workflows: typeof workflows }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        workflows,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
