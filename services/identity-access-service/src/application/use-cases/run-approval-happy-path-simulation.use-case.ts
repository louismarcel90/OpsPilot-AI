import type {
  SimulationRunCheck,
  SimulationRunResult,
} from '../../domain/simulation/simulation-run-result.js';
import type { ApprovalRequest } from '../../domain/approvals/approval-request.js';
import type { CreateWorkflowRunUseCase } from './create-workflow-run.use-case.js';
import type { ProtectedDrainWorkflowRunUseCase } from './protected-drain-workflow-run.use-case.js';
import type { ProtectedApproveApprovalRequestUseCase } from './protected-approve-approval-request.use-case.js';
import type { GetWorkflowRunDiagnosticsUseCase } from './get-workflow-run-diagnostics.use-case.js';
import type { GetWorkflowRunEvidencePackUseCase } from './get-workflow-run-evidence-pack.use-case.js';
import type { GetWorkflowRuntimeSecurityPostureUseCase } from './get-workflow-runtime-security-posture.use-case.js';
import type { ApprovalRequestReadRepository } from '../repositories/approval-request-read-repository.js';

const WORKFLOW_TEMPLATE_SLUG = 'incident-escalation-workflow';
const WORKSPACE_ID = 'wrk_ops_001';
const SYSTEM_ACTOR_ID = 'system';
const APPROVER_ACTOR_ID = 'usr_bob_001';

function buildStatus(checks: SimulationRunCheck[]): 'passed' | 'failed' {
  return checks.every((check) => check.passed) ? 'passed' : 'failed';
}

function findPendingApprovalRequest(approvalRequests: ApprovalRequest[]): ApprovalRequest | null {
  return approvalRequests.find((approvalRequest) => approvalRequest.status === 'pending') ?? null;
}

export class RunApprovalHappyPathSimulationUseCase {
  public constructor(
    private readonly createWorkflowRunUseCase: CreateWorkflowRunUseCase,
    private readonly protectedDrainWorkflowRunUseCase: ProtectedDrainWorkflowRunUseCase,
    private readonly protectedApproveApprovalRequestUseCase: ProtectedApproveApprovalRequestUseCase,
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

    const approvalRequestsAfterFirstDrain =
      await this.approvalRequestReadRepository.listByWorkflowRunId(workflowRun.id);

    const pendingApprovalRequest = findPendingApprovalRequest(approvalRequestsAfterFirstDrain);

    if (pendingApprovalRequest !== null) {
      await this.protectedApproveApprovalRequestUseCase.execute({
        approvalRequestId: pendingApprovalRequest.id,
        actorId: APPROVER_ACTOR_ID,
      });
    }

    await this.protectedDrainWorkflowRunUseCase.execute({
      runId: workflowRun.id,
      actorId: SYSTEM_ACTOR_ID,
      maxCommands: 20,
    });

    const diagnostics = await this.getWorkflowRunDiagnosticsUseCase.execute(workflowRun.id);

    const evidencePack = await this.getWorkflowRunEvidencePackUseCase.execute(workflowRun.id);

    const securityPosture = await this.getWorkflowRuntimeSecurityPostureUseCase.execute(
      workflowRun.id,
    );

    const finalRunStatus = evidencePack?.workflowRun.status ?? 'failed';
    const approvedApprovalCount = evidencePack?.diagnostics.summary.approvedApprovalCount ?? 0;
    const rejectedApprovalCount = evidencePack?.diagnostics.summary.rejectedApprovalCount ?? 0;
    const invariantViolationCount = diagnostics?.violationCount ?? 1;
    const riskLevel = securityPosture?.riskLevel ?? 'high';

    const checks: SimulationRunCheck[] = [
      {
        name: 'workflow_run_created',
        passed: workflowRun.id.length > 0,
        message: 'Workflow run was created for the approval happy path simulation.',
      },
      {
        name: 'pending_approval_created',
        passed: pendingApprovalRequest !== null,
        message:
          pendingApprovalRequest !== null
            ? 'Pending approval request was created at the approval gate.'
            : 'No pending approval request was created.',
      },
      {
        name: 'approval_request_approved',
        passed: approvedApprovalCount > 0,
        message:
          approvedApprovalCount > 0
            ? 'Approval request was approved.'
            : 'No approved approval request was found.',
      },
      {
        name: 'workflow_run_completed',
        passed: finalRunStatus === 'completed',
        message:
          finalRunStatus === 'completed'
            ? 'Workflow run completed after approval.'
            : `Workflow run did not complete. Final status=${finalRunStatus}.`,
      },
      {
        name: 'no_rejected_approval',
        passed: rejectedApprovalCount === 0,
        message:
          rejectedApprovalCount === 0
            ? 'No approval request was rejected.'
            : 'At least one approval request was rejected.',
      },
      {
        name: 'no_runtime_invariant_violation',
        passed: invariantViolationCount === 0,
        message:
          invariantViolationCount === 0
            ? 'No runtime invariant violation was detected.'
            : `Runtime invariant violations detected: ${invariantViolationCount}.`,
      },
      {
        name: 'security_posture_not_high',
        passed: riskLevel === 'low' || riskLevel === 'medium',
        message:
          riskLevel === 'low' || riskLevel === 'medium'
            ? `Security posture is acceptable: ${riskLevel}.`
            : `Security posture is high: ${riskLevel}.`,
      },
      {
        name: 'evidence_pack_available',
        passed: evidencePack !== null,
        message:
          evidencePack !== null
            ? 'Evidence pack is available for the simulated workflow run.'
            : 'Evidence pack was not available.',
      },
    ];

    const status = buildStatus(checks);

    return {
      scenarioSlug: 'approval_happy_path',
      status,
      workflowRunId: workflowRun.id,
      checks,
      summary:
        status === 'passed'
          ? 'Approval happy path simulation passed.'
          : 'Approval happy path simulation failed.',
    };
  }
}
