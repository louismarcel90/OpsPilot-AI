import type { WorkflowRunRealtimeSnapshot } from '../../domain/realtime/workflow-run-realtime-snapshot.js';
import { buildWorkflowRunDiagnostics } from '../../domain/workflows/workflow-run-diagnostics.js';
import { checkWorkflowRunInvariants } from '../../domain/workflows/workflow-run-invariants.js';
import { resolveWorkflowRuntimeEventCategory } from '../../domain/workflows/workflow-runtime-event-category.js';
import type { WorkflowRuntimeTimelineEntry } from '../../domain/workflows/workflow-runtime-timeline-entry.js';
import { projectRuntimeAuthorizationActivity } from '../../infrastructure/runtime/project-runtime-authorization-activity.js';
import { projectWorkflowRuntimeSecurityPosture } from '../../infrastructure/workflows/project-workflow-runtime-security-posture.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

const RECENT_TIMELINE_ENTRY_LIMIT = 50;

function toTimelineEntry(input: {
  readonly id: string;
  readonly workflowRunId: string;
  readonly workspaceId: string;
  readonly eventType: WorkflowRuntimeTimelineEntry['eventType'];
  readonly occurredAtIso: string;
  readonly payload: WorkflowRuntimeTimelineEntry['payload'];
}): WorkflowRuntimeTimelineEntry {
  return {
    eventId: input.id,
    workflowRunId: input.workflowRunId,
    workspaceId: input.workspaceId,
    eventType: input.eventType,
    category: resolveWorkflowRuntimeEventCategory(input.eventType),
    occurredAtIso: input.occurredAtIso,
    payload: input.payload,
  };
}

export class GetWorkflowRunRealtimeSnapshotUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRunRealtimeSnapshot | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(workflowRun.id);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(
      workflowRun.id,
    );

    const runtimeEvents = await this.workflowRuntimeEventRepository.listByWorkflowRunId(
      workflowRun.id,
    );

    const violations = checkWorkflowRunInvariants({
      workflowRun,
      runSteps,
      approvalRequests,
    });

    const diagnostics = buildWorkflowRunDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
      violations,
    });

    const authorizationActivity = projectRuntimeAuthorizationActivity({
      workflowRunId: workflowRun.id,
      events: runtimeEvents,
    });

    const securityPosture = projectWorkflowRuntimeSecurityPosture({
      workflowRunId: workflowRun.id,
      authorizationActivity,
      diagnostics,
    });

    const recentTimelineEntries = runtimeEvents
      .slice()
      .sort((left, right) => {
        const leftTime = Date.parse(left.occurredAtIso);
        const rightTime = Date.parse(right.occurredAtIso);

        if (leftTime !== rightTime) {
          return rightTime - leftTime;
        }

        return right.id.localeCompare(left.id);
      })
      .slice(0, RECENT_TIMELINE_ENTRY_LIMIT)
      .map(toTimelineEntry)
      .reverse();

    return {
      workflowRun,
      runSteps,
      approvalRequests,
      diagnostics,
      securityPosture,
      recentTimelineEntries,
      generatedAtIso: new Date().toISOString(),
    };
  }
}
