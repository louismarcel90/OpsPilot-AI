import type { SimulationScenario } from '../../domain/simulation/simulation-scenario.js';

export const SIMULATION_SCENARIO_CATALOG: SimulationScenario[] = [
  {
    id: 'sim_approval_happy_path_001',
    slug: 'approval_happy_path',
    title: 'Approval Happy Path',
    category: 'approval_runtime',
    difficulty: 'basic',
    description:
      'Simulates a governed workflow run that reaches an approval gate, receives an approval decision, and completes successfully.',
    objective:
      'Validate that approval gates block runtime progression until an authorized approval decision is recorded.',
    expectedSignals: [
      {
        name: 'blocked approval step',
        description: 'The approval gate step transitions to blocked.',
      },
      {
        name: 'approval request created',
        description: 'A pending approval request is created for the blocked step.',
      },
      {
        name: 'approval approved',
        description: 'The approval request transitions from pending to approved.',
      },
      {
        name: 'workflow completed',
        description: 'The workflow run reaches completed after approval.',
      },
    ],
    tags: ['approval', 'workflow', 'happy-path', 'runtime'],
  },
  {
    id: 'sim_approval_rejection_path_001',
    slug: 'approval_rejection_path',
    title: 'Approval Rejection Path',
    category: 'approval_runtime',
    difficulty: 'intermediate',
    description:
      'Simulates a workflow run where an approval request is rejected and the workflow run fails.',
    objective:
      'Validate that rejected approvals are treated as governed failure signals and are visible in diagnostics and security posture.',
    expectedSignals: [
      {
        name: 'approval request rejected',
        description: 'The approval request transitions from pending to rejected.',
      },
      {
        name: 'workflow failed',
        description: 'The workflow run transitions to failed after rejection.',
      },
      {
        name: 'high security posture',
        description: 'Security posture reports high risk due to rejected approval.',
      },
    ],
    tags: ['approval', 'rejection', 'failure', 'security-posture'],
  },
  {
    id: 'sim_denied_runtime_action_001',
    slug: 'denied_runtime_action',
    title: 'Denied Runtime Action',
    category: 'authorization_runtime',
    difficulty: 'intermediate',
    description:
      'Simulates a protected runtime action attempted by an actor without the required protection level.',
    objective:
      'Validate that denied runtime actions are blocked, recorded, and projected into investigation views.',
    expectedSignals: [
      {
        name: 'runtime authorization denied',
        description: 'The runtime authorization guard denies the protected action.',
      },
      {
        name: 'denied action visible',
        description: 'The denied action appears in denied runtime action investigation.',
      },
      {
        name: 'medium security posture',
        description: 'Security posture reports medium risk due to denied action.',
      },
    ],
    tags: ['authorization', 'deny', 'audit', 'investigation'],
  },
  {
    id: 'sim_workflow_step_failure_001',
    slug: 'workflow_step_failure',
    title: 'Workflow Step Failure',
    category: 'failure_runtime',
    difficulty: 'advanced',
    description: 'Simulates a workflow step failure and verifies propagation to the workflow run.',
    objective:
      'Validate that step-level failures propagate into workflow run failure and appear in diagnostics.',
    expectedSignals: [
      {
        name: 'step failed',
        description: 'A workflow run step transitions to failed.',
      },
      {
        name: 'workflow failed',
        description: 'The workflow run transitions to failed after step failure.',
      },
      {
        name: 'diagnostics failure signal',
        description: 'Runtime diagnostics detect a valid failure signal.',
      },
    ],
    tags: ['failure', 'workflow-step', 'diagnostics', 'runtime'],
  },
  {
    id: 'sim_realtime_snapshot_delta_001',
    slug: 'realtime_snapshot_delta',
    title: 'Realtime Snapshot + Delta',
    category: 'realtime_runtime',
    difficulty: 'advanced',
    description:
      'Simulates a realtime client workflow using snapshot first and SSE deltas after connection.',
    objective:
      'Validate that clients can fetch a stable snapshot, subscribe to realtime events, and receive runtime deltas.',
    expectedSignals: [
      {
        name: 'snapshot returned',
        description:
          'Realtime snapshot returns workflow run, steps, approvals, diagnostics, and recent timeline.',
      },
      {
        name: 'SSE connected',
        description: 'Realtime SSE stream sends a connected event.',
      },
      {
        name: 'delta received',
        description: 'A runtime event is streamed after a workflow mutation.',
      },
    ],
    tags: ['realtime', 'snapshot', 'sse', 'delta'],
  },
];
