export type AssistantPublishReadinessReason =
  | 'assistant_not_found'
  | 'version_not_found'
  | 'assistant_inactive'
  | 'version_already_published'
  | 'version_deprecated'
  | 'missing_model_key'
  | 'missing_system_instructions'
  | 'invalid_max_output_tokens'
  | 'invalid_temperature'
  | 'another_published_version_exists';
