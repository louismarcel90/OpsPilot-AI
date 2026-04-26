import type { WorkflowRunEvidencePack } from '../../domain/workflows/workflow-run-evidence-pack.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';

import { buildWorkflowRunDiagnostics } from '../../domain/workflows/workflow-run-diagnostics.js';
import { checkWorkflowRunInvariants } from '../../domain/workflows/workflow-run-invariants.js';

import { evaluateWorkflowEngineDiagnostics } from '../../infrastructure/workflows/evaluate-workflow-engine-diagnostics.js';
import { projectRuntimeAuthorizationActivity } from '../../infrastructure/runtime/project-runtime-authorization-activity.js';
import { projectDeniedRuntimeActions } from '../../infrastructure/runtime/project-denied-runtime-actions.js';
import { projectWorkflowRuntimeSecurityPosture } from '../../infrastructure/workflows/project-workflow-runtime-security-posture.js';

export class GetWorkflowRunEvidencePackUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(runId: string): Promise<WorkflowRunEvidencePack | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(runId);

    if (workflowRun === null) {
      return null;
    }

    const runSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(workflowRun.id);

    const approvalRequests = await this.approvalRequestReadRepository.listByWorkflowRunId(
      workflowRun.id,
    );

    const events = await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id);

    // Invariants
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

    const engineDiagnostics = evaluateWorkflowEngineDiagnostics({
      workflowRun,
      runSteps,
      approvalRequests,
    });

    const authorizationActivity = projectRuntimeAuthorizationActivity({
      workflowRunId: workflowRun.id,
      events,
    });

    const deniedActions = projectDeniedRuntimeActions({
      workflowRunId: workflowRun.id,
      events,
    });

    const securityPosture = projectWorkflowRuntimeSecurityPosture({
      workflowRunId: workflowRun.id,
      authorizationActivity,
      diagnostics,
    });

    return {
      workflowRun,
      timeline: events,
      diagnostics,
      engineDiagnostics,
      authorizationActivity,
      deniedActions,
      securityPosture,
    };
  }
}
