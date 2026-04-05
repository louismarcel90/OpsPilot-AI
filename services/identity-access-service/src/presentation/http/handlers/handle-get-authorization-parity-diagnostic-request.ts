import type { ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import type { AppLogger } from '@opspilot/logger';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';

import type { GetAuthorizationParityDiagnosticUseCase } from '../../../application/use-cases/get-authorization-parity-diagnostic.use-case.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

export async function handleGetAuthorizationParityDiagnosticRequest(
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: GetAuthorizationParityDiagnosticUseCase,
): Promise<void> {
  const diagnostic = useCase.execute();

  logger.info('Retrieved authorization parity diagnostic', {
    correlationId,
    operationName: 'handleGetAuthorizationParityDiagnosticRequest',
    httpStatusCode: 200,
    httpPath: '/diagnostics/authorization-parity',
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
