import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { CreateWorkflowRunUseCase } from '../../../application/use-cases/create-workflow-run.use-case.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function resolveInput(request: IncomingMessage): {
  readonly slug: string;
  readonly versionNumber: number;
  readonly workspaceId: string;
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const slug = url.searchParams.get('slug');
  const versionNumberRaw = url.searchParams.get('versionNumber');
  const workspaceId = url.searchParams.get('workspaceId');

  if (!slug || slug.trim().length === 0) {
    return null;
  }

  if (!versionNumberRaw || versionNumberRaw.trim().length === 0) {
    return null;
  }

  const workflowVersionNumber = Number(versionNumberRaw);

  if (!Number.isInteger(workflowVersionNumber) || workflowVersionNumber <= 0) {
    return null;
  }

  if (!workspaceId || workspaceId.trim().length === 0) {
    return null;
  }

  return {
    slug: slug.trim(),
    versionNumber: workflowVersionNumber,
    workspaceId: workspaceId.trim(),
  };
}

export async function handleCreateWorkflowRunRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  createWorkflowRunUseCase: CreateWorkflowRunUseCase,
): Promise<void> {
  const input = resolveInput(request);

  if (input === null) {
    logger.warn('Missing required workflow run creation query parameters', {
      correlationId,
      operationName: 'handleCreateWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs',
    });

    writeBadRequestResponse(
      response,
      correlationId,
      'Query parameters "slug", "versionNumber", and "workspaceId" are required.',
    );
    return;
  }

  try {
    const workflowRun = await createWorkflowRunUseCase.execute({
      slug: input.slug,
      versionNumber: input.versionNumber,
      workspaceId: input.workspaceId,
    });

    logger.info('Created workflow run', {
      correlationId,
      operationName: 'handleCreateWorkflowRunRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly workflowRun: typeof workflowRun;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          workflowRun,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Workflow run creation failed.';

    logger.warn('Workflow run creation failed', {
      correlationId,
      operationName: 'handleCreateWorkflowRunRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
