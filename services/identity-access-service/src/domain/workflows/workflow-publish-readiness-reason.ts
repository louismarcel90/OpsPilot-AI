export type WorkflowPublishReadinessReason =
  | 'workflow_not_found'
  | 'version_not_found'
  | 'workflow_inactive'
  | 'version_already_published'
  | 'version_deprecated'
  | 'missing_trigger_mode'
  | 'missing_definition_summary'
  | 'another_published_version_exists';
