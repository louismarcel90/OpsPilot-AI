import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRuntimeProtectionDiagnosticsUseCase } from '../../../application/use-cases/get-workflow-runtime-protection-diagnostics.use-case.js';
import {
  isWorkflowRuntimeProtectedAction,
  type WorkflowRuntimeProtectedAction,
} from '../../../domain/workflows/workflow-runtime-protected-action.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly workflowRunId: string;
  readonly action: WorkflowRuntimeProtectedAction;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const workflowRunId = url.searchParams.get('runId');
  const actionRaw = url.searchParams.get('action');

  if (!workflowRunId || workflowRunId.trim().length === 0) {
    return null;
  }

  if (!actionRaw || !isWorkflowRuntimeProtectedAction(actionRaw)) {
    return null;
  }

  return {
    workflowRunId: workflowRunId.trim(),
    action: actionRaw,
  };
}

export async function handleGetWorkflowRuntimeProtectionDiagnosticsRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRuntimeProtectionDiagnosticsUseCase: GetWorkflowRuntimeProtectionDiagnosticsUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing or invalid workflow runtime protection diagnostics query parameters', {
      correlationId,
      operationName: 'handleGetWorkflowRuntimeProtectionDiagnosticsRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/protection-diagnostics',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "runId" and valid "action" are required.',
    );
    return;
  }

  const protectionDiagnostics = await getWorkflowRuntimeProtectionDiagnosticsUseCase.execute(input);

  logger.info('Retrieved workflow runtime protection diagnostics', {
    correlationId,
    operationName: 'handleGetWorkflowRuntimeProtectionDiagnosticsRequest',
    httpStatusCode: 200,
    httpPath: '/workflow-runs/protection-diagnostics',
  });

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly protectionDiagnostics: typeof protectionDiagnostics;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: {
        protectionDiagnostics,
      },
      correlationId,
    },
  };

  writeJson(response, payload);
}
