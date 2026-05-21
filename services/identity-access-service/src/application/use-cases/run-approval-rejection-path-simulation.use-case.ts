import type {
  SimulationRunCheck,
  SimulationRunResult,
} from '../../domain/simulation/simulation-run-result.js';

import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';

import type { CreateWorkflowRunUseCase } from './create-workflow-run.use-case.js';
import type { ProtectedDrainWorkflowRunUseCase } from './protected-drain-workflow-run.use-case.js';
import type { ProtectedRejectApprovalRequestUseCase } from './protected-reject-approval-request.use-case.js';

import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';

import type { GetWorkflowRunDiagnosticsUseCase } from './get-workflow-run-diagnostics.use-case.js';
import type { GetWorkflowRunEvidencePackUseCase } from './get-workflow-run-evidence-pack.use-case.js';
import type { GetWorkflowRuntimeSecurityPostureUseCase } from './get-workflow-runtime-security-posture.use-case.js';

const WORKFLOW_TEMPLATE_SLUG = 'incident-escalation-workflow';
const WORKSPACE_ID = 'wrk_ops_001';

const SYSTEM_ACTOR_ID = 'system';
const APPROVER_ACTOR_ID = 'usr_approver_001';

function buildStatus(checks: SimulationRunCheck[]): 'passed' | 'failed' {
  return checks.every((check) => check.passed) ? 'passed' : 'failed';
}

function findPendingApprovalRequest(approvalRequests: ApprovalRequest[]): ApprovalRequest | null {
  return approvalRequests.find((approvalRequest) => approvalRequest.status === 'pending') ?? null;
}

export class RunApprovalRejectionPathSimulationUseCase {
  public constructor(
    private readonly createWorkflowRunUseCase: CreateWorkflowRunUseCase,
    private readonly protectedDrainWorkflowRunUseCase: ProtectedDrainWorkflowRunUseCase,
    private readonly protectedRejectApprovalRequestUseCase: ProtectedRejectApprovalRequestUseCase,
    private readonly approvalRequestReadRepository: ApprovalRequestReadRepository,
    private readonly getWorkflowRunDiagnosticsUseCase: GetWorkflowRunDiagnosticsUseCase,
    private readonly getWorkflowRunEvidencePackUseCase: GetWorkflowRunEvidencePackUseCase,
    private readonly getWorkflowRuntimeSecurityPostureUseCase: GetWorkflowRuntimeSecurityPostureUseCase,
  ) {}

  public async execute(): Promise<SimulationRunResult> {
    const workflowRun = await this.createWorkflowRunUseCase.execute({
      slug: WORKFLOW_TEMPLATE_SLUG,
      versionNumber: 2,
      workspaceId: WORKSPACE_ID,
    });

    await this.protectedDrainWorkflowRunUseCase.execute({
      runId: workflowRun.id,
      actorId: SYSTEM_ACTOR_ID,
      maxCommands: 10,
    });

    const approvalRequestsAfterDrain = await this.approvalRequestReadRepository.listByWorkflowRunId(
      workflowRun.id,
    );

    const pendingApprovalRequest = findPendingApprovalRequest(approvalRequestsAfterDrain);

    if (pendingApprovalRequest !== null) {
      await this.protectedRejectApprovalRequestUseCase.execute({
        approvalRequestId: pendingApprovalRequest.id,
        actorId: APPROVER_ACTOR_ID,
      });
    }

    const diagnostics = await this.getWorkflowRunDiagnosticsUseCase.execute(workflowRun.id);

    const evidencePack = await this.getWorkflowRunEvidencePackUseCase.execute(workflowRun.id);

    const securityPosture = await this.getWorkflowRuntimeSecurityPostureUseCase.execute(
      workflowRun.id,
    );

    const finalRunStatus = evidencePack?.workflowRun.status ?? 'completed';

    const rejectedApprovalCount = evidencePack?.diagnostics.summary.rejectedApprovalCount ?? 0;

    const approvedApprovalCount = evidencePack?.diagnostics.summary.approvedApprovalCount ?? 0;

    const riskLevel = securityPosture?.riskLevel ?? 'low';

    const invariantViolationCount = diagnostics?.violationCount ?? 0;

    const checks: SimulationRunCheck[] = [
      {
        name: 'workflow_run_created',
        passed: workflowRun.id.length > 0,
        message: 'Workflow run was created for the approval rejection simulation.',
      },

      {
        name: 'pending_approval_created',
        passed: pendingApprovalRequest !== null,
        message:
          pendingApprovalRequest !== null
            ? 'Pending approval request was created.'
            : 'No pending approval request was created.',
      },

      {
        name: 'approval_request_rejected',
        passed: rejectedApprovalCount > 0,
        message:
          rejectedApprovalCount > 0
            ? 'Approval request was rejected.'
            : 'No rejected approval request was found.',
      },

      {
        name: 'workflow_run_failed',
        passed: finalRunStatus === 'failed',
        message:
          finalRunStatus === 'failed'
            ? 'Workflow run failed after rejection.'
            : `Workflow run did not fail. Final status=${finalRunStatus}.`,
      },

      {
        name: 'no_approved_approval',
        passed: approvedApprovalCount === 0,
        message:
          approvedApprovalCount === 0
            ? 'No approval request was approved.'
            : 'At least one approval request was approved.',
      },

      {
        name: 'security_posture_high',
        passed: riskLevel === 'high',
        message:
          riskLevel === 'high'
            ? 'Security posture escalated to high.'
            : `Security posture is not high. Current=${riskLevel}.`,
      },

      {
        name: 'runtime_invariant_violation_detected',
        passed: invariantViolationCount >= 0,
        message:
          invariantViolationCount >= 0
            ? `Diagnostics collected with violation count=${invariantViolationCount}.`
            : 'Diagnostics were not available.',
      },

      {
        name: 'evidence_pack_available',
        passed: evidencePack !== null,
        message:
          evidencePack !== null
            ? 'Evidence pack is available.'
            : 'Evidence pack was not available.',
      },
    ];

    const status = buildStatus(checks);

    return {
      scenarioSlug: 'approval_rejection_path',
      status,
      workflowRunId: workflowRun.id,
      checks,
      summary:
        status === 'passed'
          ? 'Approval rejection path simulation passed.'
          : 'Approval rejection path simulation failed.',
    };
  }
}
