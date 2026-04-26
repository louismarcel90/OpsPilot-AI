import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRuntimeSecurityPostureUseCase } from '../../../application/use-cases/get-workflow-runtime-security-posture.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunId(request: IncomingMessage): string | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleGetWorkflowRuntimeSecurityPostureRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRuntimeSecurityPostureUseCase: GetWorkflowRuntimeSecurityPostureUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    logger.warn('Missing required runId query parameter', {
      correlationId,
      operationName: 'handleGetWorkflowRuntimeSecurityPostureRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/security-posture',
    });

    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const securityPosture = await getWorkflowRuntimeSecurityPostureUseCase.execute(runId);

  logger.info('Retrieved workflow runtime security posture', {
    correlationId,
    operationName: 'handleGetWorkflowRuntimeSecurityPostureRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/security-posture',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly securityPosture: typeof securityPosture;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        securityPosture,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
