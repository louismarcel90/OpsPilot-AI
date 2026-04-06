import type { ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { RevalidateAuthorizationParityUseCase } from '../../../application/use-cases/revalidate-authorization-parity.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleRevalidateAuthorizationParityRequest(
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: RevalidateAuthorizationParityUseCase,
): Promise<void> {
  const diagnostic = await useCase.execute();

  logger.info('Revalidated authorization parity diagnostic', {
    correlationId,
    operationName: 'handleRevalidateAuthorizationParityRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity/revalidate',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{ readonly diagnostic: typeof diagnostic }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        diagnostic,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
