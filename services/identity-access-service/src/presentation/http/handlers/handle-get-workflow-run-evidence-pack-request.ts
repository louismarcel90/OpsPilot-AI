import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunEvidencePackUseCase } from '../../../application/use-cases/get-workflow-run-evidence-pack.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveRunId(request: IncomingMessage): string | null {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  return runId.trim();
}

export async function handleGetWorkflowRunEvidencePackRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  useCase: GetWorkflowRunEvidencePackUseCase,
): Promise<void> {
  const runId = resolveRunId(request);

  if (runId === null) {
    writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
    return;
  }

  const evidencePack = await useCase.execute(runId);

  const payload: {
    readonly statusCode: number;
    readonly body: ApiSuccessContract<{
      readonly evidencePack: typeof evidencePack;
    }>;
  } = {
    statusCode: HTTP_STATUS_CODE.ok,
    body: {
      data: { evidencePack },
      correlationId,
    },
  };

  writeJson(response, payload);
}
