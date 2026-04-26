import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ApiSuccessContract } from '@opspilot/contracts';
import { HTTP_STATUS_CODE } from '@opspilot/http-kit';
import type { AppLogger } from '@opspilot/logger';

import type { GetWorkflowRunEvidencePackSliceUseCase } from '../../../application/use-cases/get-workflow-run-evidence-pack-slice.use-case.js';
import {
  isWorkflowRunEvidencePackSection,
  type WorkflowRunEvidencePackSection,
} from '../../../domain/workflows/workflow-run-evidence-pack-section.js';
import { writeBadRequestResponse } from '../../../infrastructure/http/responses/write-bad-request-response.js';
import { writeJson } from '../../../infrastructure/http/responses/write-json.js';

function parseSections(rawSections: string | null): WorkflowRunEvidencePackSection[] {
  if (rawSections === null || rawSections.trim().length === 0) {
    return ['workflowRun', 'diagnostics', 'securityPosture'];
  }

  const sections = rawSections
    .split(',')
    .map((section) => section.trim())
    .filter((section) => section.length > 0);

  const uniqueSections = Array.from(new Set(sections));

  const validSections: WorkflowRunEvidencePackSection[] = [];

  for (const section of uniqueSections) {
    if (!isWorkflowRunEvidencePackSection(section)) {
      throw new Error(`Invalid evidence pack section: ${section}`);
    }

    validSections.push(section);
  }

  return validSections;
}

function resolveInput(request: IncomingMessage): {
  readonly runId: string;
  readonly sections: WorkflowRunEvidencePackSection[];
} | null {
  const requestUrl = request.url ?? '/';
  const url = new URL(requestUrl, 'http://localhost');

  const runId = url.searchParams.get('runId');

  if (!runId || runId.trim().length === 0) {
    return null;
  }

  const sections = parseSections(url.searchParams.get('sections'));

  return {
    runId: runId.trim(),
    sections,
  };
}

export async function handleGetWorkflowRunEvidencePackSliceRequest(
  request: IncomingMessage,
  response: ServerResponse,
  logger: AppLogger,
  correlationId: string,
  getWorkflowRunEvidencePackSliceUseCase: GetWorkflowRunEvidencePackSliceUseCase,
): Promise<void> {
  try {
    const input = resolveInput(request);

    if (input === null) {
      logger.warn('Missing required evidence pack slice query parameters', {
        correlationId,
        operationName: 'handleGetWorkflowRunEvidencePackSliceRequest',
        httpStatusCode: 400,
        httpPath: '/workflow-runs/evidence-pack/slice',
      });

      writeBadRequestResponse(response, correlationId, 'Query parameter "runId" is required.');
      return;
    }

    const evidencePackSlice = await getWorkflowRunEvidencePackSliceUseCase.execute(input);

    logger.info('Retrieved workflow run evidence pack slice', {
      correlationId,
      operationName: 'handleGetWorkflowRunEvidencePackSliceRequest',
      httpStatusCode: 200,
      httpPath: '/workflow-runs/evidence-pack/slice',
    });

    const payload: {
      readonly statusCode: number;
      readonly body: ApiSuccessContract<{
        readonly evidencePackSlice: typeof evidencePackSlice;
      }>;
    } = {
      statusCode: HTTP_STATUS_CODE.ok,
      body: {
        data: {
          evidencePackSlice,
        },
        correlationId,
      },
    };

    writeJson(response, payload);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Workflow run evidence pack slice request failed.';

    logger.warn('Workflow run evidence pack slice request failed', {
      correlationId,
      operationName: 'handleGetWorkflowRunEvidencePackSliceRequest',
      httpStatusCode: 400,
      httpPath: '/workflow-runs/evidence-pack/slice',
      errorMessage,
    });

    writeBadRequestResponse(response, correlationId, errorMessage);
  }
}
