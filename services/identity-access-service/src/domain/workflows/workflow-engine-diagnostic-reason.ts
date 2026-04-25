export type WorkflowEngineDiagnosticReason =
  | 'workflow_run_not_started'
  | 'workflow_run_terminal_completed'
  | 'workflow_run_terminal_failed'
  | 'workflow_waiting_for_approval'
  | 'ready_step_available'
  | 'running_step_available'
  | 'no_actionable_step_found'
  | 'multiple_ready_steps_detected'
  | 'multiple_running_steps_detected'
  | 'blocked_step_without_pending_approval';
