import type {
  SimulationRunCheck,
  SimulationRunResult,
} from '../../domain/simulation/simulation-run-result.js';
import type { CreateWorkflowRunUseCase } from './create-workflow-run.use-case.js';
import type { GetDeniedRuntimeActionsUseCase } from './get-denied-runtime-actions.use-case.js';
import type { GetWorkflowRuntimeSecurityPostureUseCase } from './get-workflow-runtime-security-posture.use-case.js';
import type { ProtectedDrainWorkflowRunUseCase } from './protected-drain-workflow-run.use-case.js';

const WORKFLOW_TEMPLATE_SLUG = 'incident-escalation-workflow';
const WORKSPACE_ID = 'wrk_ops_001';
const NON_SYSTEM_ACTOR_ID = 'usr_alice_001';

function buildStatus(checks: SimulationRunCheck[]): 'passed' | 'failed' {
  return checks.every((check) => check.passed) ? 'passed' : 'failed';
}

export class RunDeniedRuntimeActionSimulationUseCase {
  public constructor(
    private readonly createWorkflowRunUseCase: CreateWorkflowRunUseCase,
    private readonly protectedDrainWorkflowRunUseCase: ProtectedDrainWorkflowRunUseCase,
    private readonly getDeniedRuntimeActionsUseCase: GetDeniedRuntimeActionsUseCase,
    private readonly getWorkflowRuntimeSecurityPostureUseCase: GetWorkflowRuntimeSecurityPostureUseCase,
  ) {}

  public async execute(): Promise<SimulationRunResult> {
    const workflowRun = await this.createWorkflowRunUseCase.execute({
      slug: WORKFLOW_TEMPLATE_SLUG,
      versionNumber: 1,
      workspaceId: WORKSPACE_ID,
    });

    let deniedByGuard = false;
    let denialMessage = '';

    try {
      await this.protectedDrainWorkflowRunUseCase.execute({
        runId: workflowRun.id,
        actorId: NON_SYSTEM_ACTOR_ID,
        maxCommands: 10,
      });
    } catch (error) {
      deniedByGuard = true;
      denialMessage =
        error instanceof Error ? error.message : 'Runtime action was denied by an unknown error.';
    }

    const deniedRuntimeActions = await this.getDeniedRuntimeActionsUseCase.execute(workflowRun.id);

    const securityPosture = await this.getWorkflowRuntimeSecurityPostureUseCase.execute(
      workflowRun.id,
    );

    const deniedActionCount = deniedRuntimeActions?.deniedActionCount ?? 0;
    const deniedDrainAction = deniedRuntimeActions?.deniedActions.find(
      (action) => action.action === 'drain_workflow_run',
    );

    const riskLevel = securityPosture?.riskLevel ?? 'low';

    const checks: SimulationRunCheck[] = [
      {
        name: 'workflow_run_created',
        passed: workflowRun.id.length > 0,
        message: 'Workflow run was created for the denied runtime action simulation.',
      },
      {
        name: 'drain_denied_by_guard',
        passed: deniedByGuard,
        message: deniedByGuard
          ? `Drain was denied for ${NON_SYSTEM_ACTOR_ID}. ${denialMessage}`
          : 'Drain was not denied. The runtime guard did not block the action.',
      },
      {
        name: 'denied_action_recorded',
        passed: deniedActionCount > 0,
        message:
          deniedActionCount > 0
            ? 'Denied runtime action was recorded in the denied-actions projection.'
            : 'No denied runtime action was recorded.',
      },
      {
        name: 'denied_action_is_drain',
        passed: deniedDrainAction !== undefined,
        message:
          deniedDrainAction !== undefined
            ? 'Denied action includes drain_workflow_run.'
            : 'Denied actions did not include drain_workflow_run.',
      },
      {
        name: 'security_posture_escalated',
        passed: riskLevel === 'medium' || riskLevel === 'high',
        message:
          riskLevel === 'medium' || riskLevel === 'high'
            ? `Security posture escalated to ${riskLevel}.`
            : 'Security posture did not escalate after denied action.',
      },
    ];

    const status = buildStatus(checks);

    return {
      scenarioSlug: 'denied_runtime_action',
      status,
      workflowRunId: workflowRun.id,
      checks,
      summary:
        status === 'passed'
          ? 'Denied runtime action simulation passed.'
          : 'Denied runtime action simulation failed.',
    };
  }
}
