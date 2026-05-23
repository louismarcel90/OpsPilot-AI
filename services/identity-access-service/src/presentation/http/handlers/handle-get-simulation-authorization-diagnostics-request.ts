import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetSimulationAuthorizationDiagnosticsUseCase } from '../../../application/use-cases/get-simulation-authorization-diagnostics.use-case.js';
import {
  isSimulationProtectedAction,
  type SimulationProtectedAction,
} from '../../../domain/simulation/simulation-protected-action.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly actorId: string;
  readonly action: SimulationProtectedAction;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const actorId = url.searchParams.get('actorId');
  const actionRaw = url.searchParams.get('action');

  if (!actorId || actorId.trim().length === 0) {
    return null;
  }

  if (!actionRaw || !isSimulationProtectedAction(actionRaw)) {
    return null;
  }

  return {
    actorId: actorId.trim(),
    action: actionRaw,
  };
}

export async function handleGetSimulationAuthorizationDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getSimulationAuthorizationDiagnosticsUseCase: GetSimulationAuthorizationDiagnosticsUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid simulation authorization query parameters', {
      correlationId,
      operationName: 'handleGetSimulationAuthorizationDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/simulation/authorization',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "actorId" and valid "action" are required.',
    );
    return;
  }

  const authorizationDecision = await getSimulationAuthorizationDiagnosticsUseCase.execute(input);

  logger.info('Retrieved simulation authorization diagnostics', {
    correlationId,
    operationName: 'handleGetSimulationAuthorizationDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/simulation/authorization',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly authorizationDecision: typeof authorizationDecision;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        authorizationDecision,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
