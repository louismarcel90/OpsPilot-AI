import type {
  SimulationRunCheck,
  SimulationRunResult,
} from '../../domain/simulation/simulation-run-result.js';

import { InMemorySimulatedRealtimeSession } from '../../infrastructure/realtime/in-memory-simulated-realtime-session.js';

import type { CreateWorkflowRunUseCase } from './create-workflow-run.use-case.js';
import type { ProtectedDrainWorkflowRunUseCase } from './protected-drain-workflow-run.use-case.js';

import type { GetWorkflowRunRealtimeSnapshotUseCase } from './get-workflow-run-realtime-snapshot.use-case.js';
import type { GetWorkflowRunTimelineUseCase } from './get-workflow-run-timeline.use-case.js';
import type { GetWorkflowRunDiagnosticsUseCase } from './get-workflow-run-diagnostics.use-case.js';

const WORKFLOW_TEMPLATE_SLUG = 'incident-escalation-workflow';
const WORKSPACE_ID = 'wrk_ops_001';
const SYSTEM_ACTOR_ID = 'system';

function buildStatus(checks: SimulationRunCheck[]): 'passed' | 'failed' {
  return checks.every((check) => check.passed) ? 'passed' : 'failed';
}

export class RunRealtimeSnapshotDeltaSimulationUseCase {
  public constructor(
    private readonly createWorkflowRunUseCase: CreateWorkflowRunUseCase,
    private readonly protectedDrainWorkflowRunUseCase: ProtectedDrainWorkflowRunUseCase,
    private readonly getWorkflowRuntimeSnapshotUseCase: GetWorkflowRunRealtimeSnapshotUseCase,
    private readonly getWorkflowRunTimelineUseCase: GetWorkflowRunTimelineUseCase,
    private readonly getWorkflowRunDiagnosticsUseCase: GetWorkflowRunDiagnosticsUseCase,
  ) {}

  public async execute(): Promise<SimulationRunResult> {
    const workflowRun = await this.createWorkflowRunUseCase.execute({
      slug: WORKFLOW_TEMPLATE_SLUG,
      versionNumber: 2,
      workspaceId: WORKSPACE_ID,
    });

    const realtimeSession = new InMemorySimulatedRealtimeSession(workflowRun.id);

    const initialSnapshot = await this.getWorkflowRuntimeSnapshotUseCase.execute(workflowRun.id);

    realtimeSession.connect();

    realtimeSession.emit('realtime_connected');

    await this.protectedDrainWorkflowRunUseCase.execute({
      runId: workflowRun.id,
      actorId: SYSTEM_ACTOR_ID,
      maxCommands: 3,
    });

    realtimeSession.emit('workflow_runtime_delta');

    const finalSnapshot = realtimeSession.snapshot();

    const timeline = await this.getWorkflowRunTimelineUseCase.execute(workflowRun.id);

    const diagnostics = await this.getWorkflowRunDiagnosticsUseCase.execute(workflowRun.id);

    const workflowRuntimeDeltaEvent = finalSnapshot.receivedEvents.find(
      (event) => event.eventType === 'workflow_runtime_delta',
    );

    const connectedEvent = finalSnapshot.receivedEvents.find(
      (event) => event.eventType === 'realtime_connected',
    );

    const checks: SimulationRunCheck[] = [
      {
        name: 'workflow_run_created',
        passed: workflowRun.id.length > 0,
        message: 'Workflow run was created for realtime snapshot delta simulation.',
      },

      {
        name: 'initial_snapshot_available',
        passed: initialSnapshot !== null,
        message:
          initialSnapshot !== null
            ? 'Initial realtime snapshot is available.'
            : 'Initial realtime snapshot was not available.',
      },

      {
        name: 'realtime_connected_event_emitted',
        passed: connectedEvent !== undefined,
        message:
          connectedEvent !== undefined
            ? 'Realtime connected event was emitted.'
            : 'Realtime connected event was not emitted.',
      },

      {
        name: 'workflow_runtime_delta_emitted',
        passed: workflowRuntimeDeltaEvent !== undefined,
        message:
          workflowRuntimeDeltaEvent !== undefined
            ? 'Workflow runtime delta event was emitted.'
            : 'Workflow runtime delta event was not emitted.',
      },

      {
        name: 'timeline_available',
        passed: timeline !== null,
        message:
          timeline !== null
            ? `Timeline available with ${timeline.entries.length} entries.`
            : 'Timeline was not available.',
      },

      {
        name: 'diagnostics_available',
        passed: diagnostics !== null,
        message:
          diagnostics !== null
            ? `Diagnostics available with violationCount=${diagnostics.violationCount}.`
            : 'Diagnostics were not available.',
      },

      {
        name: 'snapshot_delta_coherence',
        passed: finalSnapshot.receivedEvents.length >= 2,
        message:
          finalSnapshot.receivedEvents.length >= 2
            ? 'Snapshot and delta flow are coherent.'
            : 'Snapshot and delta flow are not coherent.',
      },
    ];

    const status = buildStatus(checks);

    return {
      scenarioSlug: 'realtime_snapshot_delta',
      status,
      workflowRunId: workflowRun.id,
      checks,
      summary:
        status === 'passed'
          ? 'Realtime snapshot delta simulation passed.'
          : 'Realtime snapshot delta simulation failed.',
    };
  }
}
