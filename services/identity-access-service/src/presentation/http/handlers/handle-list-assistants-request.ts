import type { ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { ListAssistantsUseCase } from '../../../application/use-cases/list-assistants.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleListAssistantsRequest(
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  listAssistantsUseCase: ListAssistantsUseCase,
): Promise<void> {
  const assistants = await listAssistantsUseCase.execute();

  logger.info('Retrieved assistants', {
    correlationId,
    operationName: 'handleListAssistantsRequest',
    httpStatusCode: 200,
    httpPath: '/assistants',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly assistants: typeof assistants }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        assistants,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
