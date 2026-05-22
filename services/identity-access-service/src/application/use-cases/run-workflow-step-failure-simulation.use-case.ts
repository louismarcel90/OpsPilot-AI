import type {
  SimulationRunCheck,
  SimulationRunResult,
} from '../../domain/simulation/simulation-run-result.js';

import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';

import type { CreateWorkflowRunUseCase } from './create-workflow-run.use-case.js';
import type { ProtectedDrainWorkflowRunUseCase } from './protected-drain-workflow-run.use-case.js';
import type { FailWorkflowRunStepUseCase } from './fail-workflow-run-step.use-case.js';
import type { GetWorkflowRunDiagnosticsUseCase } from './get-workflow-run-diagnostics.use-case.js';
import type { GetWorkflowRunEvidencePackUseCase } from './get-workflow-run-evidence-pack.use-case.js';
import type { GetWorkflowRuntimeSecurityPostureUseCase } from './get-workflow-runtime-security-posture.use-case.js';

import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';

const WORKFLOW_TEMPLATE_SLUG = 'incident-escalation-workflow';
const WORKSPACE_ID = 'wrk_ops_001';
const SYSTEM_ACTOR_ID = 'system';

function buildStatus(checks: SimulationRunCheck[]): 'passed' | 'failed' {
  return checks.every((check) => check.passed) ? 'passed' : 'failed';
}

function findRunningStep(runSteps: WorkflowRunStep[]): WorkflowRunStep | null {
  return runSteps.find((runStep) => runStep.status === 'running') ?? null;
}

export class RunWorkflowStepFailureSimulationUseCase {
  public constructor(
    private readonly createWorkflowRunUseCase: CreateWorkflowRunUseCase,
    private readonly protectedDrainWorkflowRunUseCase: ProtectedDrainWorkflowRunUseCase,
    private readonly failWorkflowRunStepUseCase: FailWorkflowRunStepUseCase,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
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
      maxCommands: 2,
    });

    const runStepsAfterDrain = await this.workflowRunStepReadRepository.listByWorkflowRunId(
      workflowRun.id,
    );

    const runningStep = findRunningStep(runStepsAfterDrain);

    if (runningStep !== null) {
      await this.failWorkflowRunStepUseCase.execute(runningStep.id);
    }

    const diagnostics = await this.getWorkflowRunDiagnosticsUseCase.execute(workflowRun.id);

    const evidencePack = await this.getWorkflowRunEvidencePackUseCase.execute(workflowRun.id);

    const securityPosture = await this.getWorkflowRuntimeSecurityPostureUseCase.execute(
      workflowRun.id,
    );

    const finalRunStatus = evidencePack?.workflowRun.status ?? 'completed';
    const failedStepCount = evidencePack?.diagnostics.summary.failedStepCount ?? 0;
    const riskLevel = securityPosture?.riskLevel ?? 'low';
    const invariantViolationCount = diagnostics?.violationCount ?? 0;

    const checks: SimulationRunCheck[] = [
      {
        name: 'workflow_run_created',
        passed: workflowRun.id.length > 0,
        message: 'Workflow run was created for the workflow step failure simulation.',
      },
      {
        name: 'running_step_found',
        passed: runningStep !== null,
        message:
          runningStep !== null
            ? `Running step was found: ${runningStep.id}.`
            : 'No running workflow run step was found.',
      },
      {
        name: 'workflow_step_failed',
        passed: failedStepCount > 0,
        message:
          failedStepCount > 0
            ? 'At least one workflow run step failed.'
            : 'No failed workflow run step was found.',
      },
      {
        name: 'workflow_run_failed',
        passed: finalRunStatus === 'failed',
        message:
          finalRunStatus === 'failed'
            ? 'Workflow run failed after step failure.'
            : `Workflow run did not fail. Final status=${finalRunStatus}.`,
      },
      {
        name: 'security_posture_high',
        passed: riskLevel === 'high',
        message:
          riskLevel === 'high'
            ? 'Security posture escalated to high after step failure.'
            : `Security posture is not high. Current=${riskLevel}.`,
      },
      {
        name: 'diagnostics_available',
        passed: diagnostics !== null,
        message:
          diagnostics !== null
            ? `Diagnostics available with violationCount=${invariantViolationCount}.`
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
      scenarioSlug: 'workflow_step_failure',
      status,
      workflowRunId: workflowRun.id,
      checks,
      summary:
        status === 'passed'
          ? 'Workflow step failure simulation passed.'
          : 'Workflow step failure simulation failed.',
    };
  }
}
