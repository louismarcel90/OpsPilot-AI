import type { WorkflowRuntimeProtectedAction } from './workflow-runtime-protected-action.js';

export type WorkflowRuntimeProtectionLevel = 'operator' | 'admin' | 'system' | 'approval_decider';

export interface WorkflowRuntimeProtectionDiagnostics {
  readonly action: WorkflowRuntimeProtectedAction;
  readonly workflowRunId: string;
  readonly protectionLevel: WorkflowRuntimeProtectionLevel;
  readonly isSensitive: boolean;
  readonly requiresAudit: boolean;
  readonly requiresApprovalAuthority: boolean;
  readonly reason: string;
}
