export interface MetricNameCatalog {
  readonly httpRequestsTotal: 'http_requests_total';
  readonly httpRequestDurationMilliseconds: 'http_request_duration_milliseconds';
  readonly workflowRunsTotal: 'workflow_runs_total';
  readonly policyEvaluationsTotal: 'policy_evaluations_total';
}

export const METRIC_NAMES: MetricNameCatalog = {
  httpRequestsTotal: 'http_requests_total',
  httpRequestDurationMilliseconds: 'http_request_duration_milliseconds',
  workflowRunsTotal: 'workflow_runs_total',
  policyEvaluationsTotal: 'policy_evaluations_total',
};
