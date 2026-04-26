import type { WorkflowRuntimeSecurityPosture } from '../../domain/workflows/workflow-runtime-security-posture.js';
import { projectRuntimeAuthorizationActivity } from '../../infrastructure/runtime/project-runtime-authorization-activity.js';
import { projectWorkflowRuntimeSecurityPosture } from '../../infrastructure/workflows/project-workflow-runtime-security-posture.js';
import {
  buildWorkflowRunDiagnostics,
  type WorkflowRunDiagnostics,
} from '../../domain/workflows/workflow-run-diagnostics.js';
import { checkWorkflowRunInvariants } from '../../domain/workflows/workflow-run-invariants.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

export class GetWorkflowRuntimeSecurityPostureUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRuntimeSecurityPosture | null> {
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

    const diagnostics: WorkflowRunDiagnostics = buildWorkflowRunDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
      violations,
    });

    const authorizationActivity = projectRuntimeAuthorizationActivity({
      workflowRunId: workflowRun.id,
      events: runtimeEvents,
    });

    return projectWorkflowRuntimeSecurityPosture({
      workflowRunId: workflowRun.id,
      authorizationActivity,
      diagnostics,
    });
  }
}
