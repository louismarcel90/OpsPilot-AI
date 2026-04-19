export type WorkflowStepConsistencyIssueCode =
  | 'missing_assistant_binding'
  | 'missing_tool_binding'
  | 'unexpected_assistant_binding'
  | 'unexpected_tool_binding'
  | 'approval_gate_requires_approval'
  | 'unknown_assistant_binding'
  | 'unknown_tool_binding';
