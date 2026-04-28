import type { ApprovalRequest } from '../approvals/approval-request.js';
import type { WorkflowRun } from '../workflows/workflow-run.js';
import type { WorkflowRunStep } from '../workflows/workflow-run-step.js';
import type { WorkflowRunDiagnostics } from '../workflows/workflow-run-diagnostics.js';
import type { WorkflowRuntimeSecurityPosture } from '../workflows/workflow-runtime-security-posture.js';
import type { WorkflowRuntimeTimelineEntry } from '../workflows/workflow-runtime-timeline-entry.js';

export interface WorkflowRunRealtimeSnapshot {
  readonly workflowRun: WorkflowRun;
  readonly runSteps: WorkflowRunStep[];
  readonly approvalRequests: ApprovalRequest[];
  readonly diagnostics: WorkflowRunDiagnostics;
  readonly securityPosture: WorkflowRuntimeSecurityPosture;
  readonly recentTimelineEntries: WorkflowRuntimeTimelineEntry[];
  readonly generatedAtIso: string;
}
