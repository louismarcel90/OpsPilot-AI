import type { WorkflowRunEvidencePackSection } from '../../domain/workflows/workflow-run-evidence-pack-section.js';
import type { WorkflowRunEvidencePackSlice } from '../../domain/workflows/workflow-run-evidence-pack-slice.js';
import { buildWorkflowRunDiagnostics } from '../../domain/workflows/workflow-run-diagnostics.js';
import { checkWorkflowRunInvariants } from '../../domain/workflows/workflow-run-invariants.js';
import { projectRuntimeAuthorizationActivity } from '../../infrastructure/runtime/project-runtime-authorization-activity.js';
import { projectDeniedRuntimeActions } from '../../infrastructure/runtime/project-denied-runtime-actions.js';
import { evaluateWorkflowEngineDiagnostics } from '../../infrastructure/workflows/evaluate-workflow-engine-diagnostics.js';
import { projectWorkflowRuntimeSecurityPosture } from '../../infrastructure/workflows/project-workflow-runtime-security-posture.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRuntimeEventRepository } from '../repositories/workflow-runtime-event-repository.js';

function includesSection(
  sections: WorkflowRunEvidencePackSection[],
  section: WorkflowRunEvidencePackSection,
): boolean {
  return sections.includes(section);
}

export class GetWorkflowRunEvidencePackSliceUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly workflowRuntimeEventRepository: WorkflowRuntimeEventRepository,
  ) {}

  public async execute(input: {
    readonly runId: string;
    readonly sections: WorkflowRunEvidencePackSection[];
  }): Promise<WorkflowRunEvidencePackSlice | null> {
    const workflowRun = await this.workflowRunReadRepository.findById(input.runId);

    if (workflowRun === null) {
      return null;
    }

    const needsRunSteps =
      includesSection(input.sections, 'diagnostics') ||
      includesSection(input.sections, 'engineDiagnostics') ||
      includesSection(input.sections, 'securityPosture');

    const needsApprovalRequests =
      includesSection(input.sections, 'diagnostics') ||
      includesSection(input.sections, 'engineDiagnostics') ||
      includesSection(input.sections, 'securityPosture');

    const needsRuntimeEvents =
      includesSection(input.sections, 'timeline') ||
      includesSection(input.sections, 'authorizationActivity') ||
      includesSection(input.sections, 'deniedActions') ||
      includesSection(input.sections, 'securityPosture');

    const runSteps = needsRunSteps
      ? await this.workflowRunStepReadRepository.listByWorkflowRunId(workflowRun.id)
      : [];

    const approvalRequests = needsApprovalRequests
      ? await this.approvalRequestReadRepository.listByWorkflowRunId(workflowRun.id)
      : [];

    const runtimeEvents = needsRuntimeEvents
      ? await this.workflowRuntimeEventRepository.listByWorkflowRunId(workflowRun.id)
      : [];

    const violations =
      needsRunSteps || needsApprovalRequests
        ? checkWorkflowRunInvariants({
            workflowRun,
            runSteps,
            approvalRequests,
          })
        : [];

    const diagnostics =
      includesSection(input.sections, 'diagnostics') ||
      includesSection(input.sections, 'securityPosture')
        ? buildWorkflowRunDiagnostics({
            workflowRun,
            runSteps,
            approvalRequests,
            violations,
          })
        : undefined;

    const engineDiagnostics = includesSection(input.sections, 'engineDiagnostics')
      ? evaluateWorkflowEngineDiagnostics({
          workflowRun,
          runSteps,
          approvalRequests,
        })
      : undefined;

    const authorizationActivity =
      includesSection(input.sections, 'authorizationActivity') ||
      includesSection(input.sections, 'securityPosture')
        ? projectRuntimeAuthorizationActivity({
            workflowRunId: workflowRun.id,
            events: runtimeEvents,
          })
        : undefined;

    const deniedActions = includesSection(input.sections, 'deniedActions')
      ? projectDeniedRuntimeActions({
          workflowRunId: workflowRun.id,
          events: runtimeEvents,
        })
      : undefined;

    const securityPosture =
      includesSection(input.sections, 'securityPosture') &&
      diagnostics !== undefined &&
      authorizationActivity !== undefined
        ? projectWorkflowRuntimeSecurityPosture({
            workflowRunId: workflowRun.id,
            authorizationActivity,
            diagnostics,
          })
        : undefined;

    return {
      workflowRunId: workflowRun.id,
      includedSections: input.sections,
      ...(includesSection(input.sections, 'workflowRun') ? { workflowRun } : {}),
      ...(includesSection(input.sections, 'timeline') ? { timeline: runtimeEvents } : {}),
      ...(diagnostics !== undefined && includesSection(input.sections, 'diagnostics')
        ? { diagnostics }
        : {}),
      ...(engineDiagnostics !== undefined ? { engineDiagnostics } : {}),
      ...(authorizationActivity !== undefined &&
      includesSection(input.sections, 'authorizationActivity')
        ? { authorizationActivity }
        : {}),
      ...(deniedActions !== undefined ? { deniedActions } : {}),
      ...(securityPosture !== undefined ? { securityPosture } : {}),
    };
  }
}
