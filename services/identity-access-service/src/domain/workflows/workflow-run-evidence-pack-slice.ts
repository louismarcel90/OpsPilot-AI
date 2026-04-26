import type { RuntimeAuthorizationActivitySummary } from '../runtime/runtime-authorization-activity-summary.js';
import type { DeniedRuntimeActionSummary } from '../runtime/denied-runtime-action-summary.js';
import type { WorkflowEngineDiagnostics } from './workflow-engine-diagnostics.js';
import type { WorkflowRunDiagnostics } from './workflow-run-diagnostics.js';
import type { WorkflowRunEvidencePackSection } from './workflow-run-evidence-pack-section.js';
import type { WorkflowRun } from './workflow-run.js';
import type { WorkflowRuntimeEvent } from './workflow-runtime-event.js';
import type { WorkflowRuntimeSecurityPosture } from './workflow-runtime-security-posture.js';

export interface WorkflowRunEvidencePackSlice {
  readonly workflowRunId: string;
  readonly includedSections: WorkflowRunEvidencePackSection[];
  readonly workflowRun?: WorkflowRun;
  readonly timeline?: WorkflowRuntimeEvent[];
  readonly diagnostics?: WorkflowRunDiagnostics;
  readonly engineDiagnostics?: WorkflowEngineDiagnostics;
  readonly authorizationActivity?: RuntimeAuthorizationActivitySummary;
  readonly deniedActions?: DeniedRuntimeActionSummary;
  readonly securityPosture?: WorkflowRuntimeSecurityPosture;
}
