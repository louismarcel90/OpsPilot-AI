import type { SimulationScenarioDetail } from '../../domain/simulation/simulation-scenario-detail.js';
import type {
  SimulationScenarioExecutionPlan,
  SimulationScenarioExecutionStep,
} from '../../domain/simulation/simulation-scenario-execution-plan.js';
import type { SimulationScenario } from '../../domain/simulation/simulation-scenario.js';

function buildApprovalHappyPathSteps(): SimulationScenarioExecutionStep[] {
  return [
    {
      sequenceNumber: 1,
      actor: 'operator',
      kind: 'create_workflow_run',
      title: 'Create governed workflow run',
      description: 'Create a workflow run from the incident escalation workflow template.',
      expectedOutcome: 'A workflow run is created with initial run steps.',
    },
    {
      sequenceNumber: 2,
      actor: 'system',
      kind: 'drain_workflow_run',
      title: 'Drain until approval gate',
      description: 'Run bounded auto-progression until the workflow reaches an approval gate.',
      expectedOutcome:
        'The workflow stops at a blocked approval step with a pending approval request.',
    },
    {
      sequenceNumber: 3,
      actor: 'approver',
      kind: 'approve_approval_request',
      title: 'Approve pending approval request',
      description: 'Approve the pending request using an actor with approval authority.',
      expectedOutcome:
        'The approval request transitions to approved and the blocked step becomes ready.',
    },
    {
      sequenceNumber: 4,
      actor: 'system',
      kind: 'drain_workflow_run',
      title: 'Drain to completion',
      description: 'Continue bounded auto-progression after approval.',
      expectedOutcome: 'The workflow run reaches completed and diagnostics remain consistent.',
    },
    {
      sequenceNumber: 5,
      actor: 'operator',
      kind: 'inspect_evidence',
      title: 'Inspect evidence pack',
      description:
        'Fetch the workflow evidence pack to verify timeline, diagnostics, authorization activity, and posture.',
      expectedOutcome:
        'Evidence pack shows approval happy path with low or acceptable risk posture.',
    },
  ];
}

function buildApprovalRejectionPathSteps(): SimulationScenarioExecutionStep[] {
  return [
    {
      sequenceNumber: 1,
      actor: 'operator',
      kind: 'create_workflow_run',
      title: 'Create governed workflow run',
      description: 'Create a workflow run from the incident escalation workflow template.',
      expectedOutcome: 'A workflow run is created and ready for runtime progression.',
    },
    {
      sequenceNumber: 2,
      actor: 'system',
      kind: 'drain_workflow_run',
      title: 'Drain until approval gate',
      description: 'Run bounded auto-progression until an approval gate blocks execution.',
      expectedOutcome: 'A pending approval request exists for the blocked approval gate.',
    },
    {
      sequenceNumber: 3,
      actor: 'approver',
      kind: 'reject_approval_request',
      title: 'Reject pending approval request',
      description: 'Reject the pending approval request using an approval-authorized actor.',
      expectedOutcome: 'The approval request transitions to rejected and the workflow run fails.',
    },
    {
      sequenceNumber: 4,
      actor: 'operator',
      kind: 'inspect_diagnostics',
      title: 'Inspect runtime diagnostics',
      description: 'Fetch workflow diagnostics and security posture after rejection.',
      expectedOutcome:
        'Diagnostics show a valid failure signal and security posture reports high risk.',
    },
  ];
}

function buildDeniedRuntimeActionSteps(): SimulationScenarioExecutionStep[] {
  return [
    {
      sequenceNumber: 1,
      actor: 'operator',
      kind: 'create_workflow_run',
      title: 'Create workflow run',
      description:
        'Create a workflow run that will be used to test protected runtime authorization.',
      expectedOutcome: 'A workflow run exists for the denied-action scenario.',
    },
    {
      sequenceNumber: 2,
      actor: 'operator',
      kind: 'drain_workflow_run',
      title: 'Attempt system-level drain as non-system actor',
      description:
        'Attempt to drain the workflow run using an actor without system-level permission.',
      expectedOutcome:
        'The runtime authorization guard denies the action and records a denied event.',
    },
    {
      sequenceNumber: 3,
      actor: 'operator',
      kind: 'inspect_evidence',
      title: 'Inspect denied action evidence',
      description: 'Fetch denied-actions and authorization-activity views.',
      expectedOutcome:
        'Denied action appears with actor id, actor role, action, required level, and denial reason.',
    },
  ];
}

function buildWorkflowStepFailureSteps(): SimulationScenarioExecutionStep[] {
  return [
    {
      sequenceNumber: 1,
      actor: 'operator',
      kind: 'create_workflow_run',
      title: 'Create workflow run',
      description: 'Create a workflow run for failure propagation testing.',
      expectedOutcome: 'A workflow run is created with initial run steps.',
    },
    {
      sequenceNumber: 2,
      actor: 'operator',
      kind: 'advance_workflow_run',
      title: 'Advance to a running step',
      description: 'Advance the workflow until a run step is running.',
      expectedOutcome: 'A workflow run step reaches running state.',
    },
    {
      sequenceNumber: 3,
      actor: 'operator',
      kind: 'fail_workflow_run_step',
      title: 'Fail the running step',
      description: 'Fail the selected workflow run step to test failure propagation.',
      expectedOutcome: 'The step transitions to failed and the workflow run transitions to failed.',
    },
    {
      sequenceNumber: 4,
      actor: 'operator',
      kind: 'inspect_diagnostics',
      title: 'Inspect failure diagnostics',
      description: 'Fetch runtime diagnostics and security posture.',
      expectedOutcome:
        'Diagnostics show a valid failure signal and security posture reports high risk.',
    },
  ];
}

function buildRealtimeSnapshotDeltaSteps(): SimulationScenarioExecutionStep[] {
  return [
    {
      sequenceNumber: 1,
      actor: 'operator',
      kind: 'create_workflow_run',
      title: 'Create workflow run',
      description: 'Create a workflow run for realtime snapshot and delta testing.',
      expectedOutcome: 'A workflow run exists.',
    },
    {
      sequenceNumber: 2,
      actor: 'operator',
      kind: 'fetch_realtime_snapshot',
      title: 'Fetch realtime snapshot',
      description: 'Fetch the current realtime snapshot before opening the SSE stream.',
      expectedOutcome:
        'Snapshot returns workflow run, steps, approvals, diagnostics, security posture, and recent timeline.',
    },
    {
      sequenceNumber: 3,
      actor: 'operator',
      kind: 'open_realtime_stream',
      title: 'Open SSE realtime stream',
      description: 'Open the workflow run SSE stream.',
      expectedOutcome: 'The stream emits a connected event and heartbeats.',
    },
    {
      sequenceNumber: 4,
      actor: 'operator',
      kind: 'advance_workflow_run',
      title: 'Advance workflow run',
      description: 'Advance the workflow while the SSE stream is open.',
      expectedOutcome:
        'The SSE stream receives runtime deltas for authorization and workflow transitions.',
    },
  ];
}

function buildExecutionStepsForScenarioSlug(slug: string): SimulationScenarioExecutionStep[] {
  if (slug === 'approval_happy_path') {
    return buildApprovalHappyPathSteps();
  }

  if (slug === 'approval_rejection_path') {
    return buildApprovalRejectionPathSteps();
  }

  if (slug === 'denied_runtime_action') {
    return buildDeniedRuntimeActionSteps();
  }

  if (slug === 'workflow_step_failure') {
    return buildWorkflowStepFailureSteps();
  }

  if (slug === 'realtime_snapshot_delta') {
    return buildRealtimeSnapshotDeltaSteps();
  }

  return [];
}

function buildExecutionPlan(scenario: SimulationScenario): SimulationScenarioExecutionPlan {
  return {
    scenarioSlug: scenario.slug,
    isExecutablePreview: false,
    steps: buildExecutionStepsForScenarioSlug(scenario.slug),
  };
}

export function projectSimulationScenarioDetail(
  scenario: SimulationScenario,
): SimulationScenarioDetail {
  return {
    scenario,
    executionPlan: buildExecutionPlan(scenario),
  };
}
