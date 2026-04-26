export const WORKFLOW_RUN_EVIDENCE_PACK_SECTION_VALUES = [
  'workflowRun',
  'timeline',
  'diagnostics',
  'engineDiagnostics',
  'authorizationActivity',
  'deniedActions',
  'securityPosture',
] as const;

export type WorkflowRunEvidencePackSection =
  (typeof WORKFLOW_RUN_EVIDENCE_PACK_SECTION_VALUES)[number];

export function isWorkflowRunEvidencePackSection(
  value: string,
): value is WorkflowRunEvidencePackSection {
  return WORKFLOW_RUN_EVIDENCE_PACK_SECTION_VALUES.includes(
    value as WorkflowRunEvidencePackSection,
  );
}
