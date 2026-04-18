import type { PostgresConnection } from '../create-postgres-connection.js';
import { workflowStepDefinitionsTable } from '../schema/workflow-step-definitions.table.js';
import { workflowTemplatesTable } from '../schema/workflow-templates.table.js';
import { workflowVersionsTable } from '../schema/workflow-versions.table.js';

const WORKFLOW_SEED_IDS = {
  incidentEscalationWorkflow: 'wf_tpl_incident_escalation_001',
  changeApprovalWorkflow: 'wf_tpl_change_approval_001',
  runbookExecutionWorkflow: 'wf_tpl_runbook_execution_001',
  incidentEscalationV1: 'wf_ver_incident_escalation_001',
  incidentEscalationV2: 'wf_ver_incident_escalation_002',
  changeApprovalV1: 'wf_ver_change_approval_001',
  runbookExecutionV1: 'wf_ver_runbook_execution_001',
  incidentEscalationV2StepSeverityReview: 'wf_step_incident_escalation_v2_001',
  incidentEscalationV2StepOwnerAssignment: 'wf_step_incident_escalation_v2_002',
  incidentEscalationV2StepEscalationApproval: 'wf_step_incident_escalation_v2_003',
  changeApprovalV1StepReviewRequest: 'wf_step_change_approval_v1_001',
  changeApprovalV1StepApprovalGate: 'wf_step_change_approval_v1_002',
  runbookExecutionV1StepAiPreparation: 'wf_step_runbook_execution_v1_001',
  runbookExecutionV1StepToolExecution: 'wf_step_runbook_execution_v1_002',
} as const;

const WORKFLOW_SCOPE = {
  tenantId: 'ten_acme_001',
  workspaceId: 'wrk_ops_001',
  createdByActorId: 'usr_alice_001',
  updatedByActorId: 'usr_alice_001',
} as const;

export async function seedWorkflowFoundation(connection: PostgresConnection): Promise<void> {
  await connection.db
    .insert(workflowTemplatesTable)
    .values([
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationWorkflow,
        tenantId: WORKFLOW_SCOPE.tenantId,
        workspaceId: WORKFLOW_SCOPE.workspaceId,
        slug: 'incident-escalation-workflow',
        displayName: 'Incident Escalation Workflow',
        description:
          'Escalates operational incidents through severity review, owner assignment, and escalation routing.',
        isActive: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.changeApprovalWorkflow,
        tenantId: WORKFLOW_SCOPE.tenantId,
        workspaceId: WORKFLOW_SCOPE.workspaceId,
        slug: 'change-approval-workflow',
        displayName: 'Change Approval Workflow',
        description:
          'Coordinates request review, approval validation, and controlled change authorization.',
        isActive: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.runbookExecutionWorkflow,
        tenantId: WORKFLOW_SCOPE.tenantId,
        workspaceId: WORKFLOW_SCOPE.workspaceId,
        slug: 'runbook-execution-workflow',
        displayName: 'Runbook Execution Workflow',
        description:
          'Guides controlled operational execution through structured runbook-aligned steps.',
        isActive: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
    ])
    .onConflictDoNothing({ target: workflowTemplatesTable.id });

  await connection.db
    .insert(workflowVersionsTable)
    .values([
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationV1,
        workflowTemplateId: WORKFLOW_SEED_IDS.incidentEscalationWorkflow,
        versionNumber: 1,
        lifecycleStatus: 'draft',
        triggerMode: 'manual',
        definitionSummary:
          'Initial incident escalation workflow with severity review and escalation handoff.',
        changeSummary: 'Initial workflow definition.',
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationV2,
        workflowTemplateId: WORKFLOW_SEED_IDS.incidentEscalationWorkflow,
        versionNumber: 2,
        lifecycleStatus: 'published',
        triggerMode: 'manual',
        definitionSummary:
          'Refined escalation workflow with clearer severity gates, owner assignment, and escalation routing.',
        changeSummary: 'Improved escalation routing and responsibility handoff structure.',
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.changeApprovalV1,
        workflowTemplateId: WORKFLOW_SEED_IDS.changeApprovalWorkflow,
        versionNumber: 1,
        lifecycleStatus: 'draft',
        triggerMode: 'manual',
        definitionSummary:
          'Initial change approval workflow coordinating review, risk confirmation, and final approval.',
        changeSummary: 'Initial workflow definition.',
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.runbookExecutionV1,
        workflowTemplateId: WORKFLOW_SEED_IDS.runbookExecutionWorkflow,
        versionNumber: 1,
        lifecycleStatus: 'published',
        triggerMode: 'manual',
        definitionSummary:
          'Initial runbook execution workflow for guided operational procedure execution.',
        changeSummary: 'Initial published runbook execution workflow.',
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
    ])
    .onConflictDoNothing({ target: workflowVersionsTable.id });

  await connection.db
    .insert(workflowStepDefinitionsTable)
    .values([
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationV2StepSeverityReview,
        workflowVersionId: WORKFLOW_SEED_IDS.incidentEscalationV2,
        stepKey: 'severity-review',
        displayName: 'Severity Review',
        description: 'Review the incident severity and validate escalation criteria.',
        stepType: 'human_task',
        sequenceNumber: 1,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationV2StepOwnerAssignment,
        workflowVersionId: WORKFLOW_SEED_IDS.incidentEscalationV2,
        stepKey: 'owner-assignment',
        displayName: 'Owner Assignment',
        description: 'Assign an operational owner to coordinate the escalation.',
        stepType: 'tool_task',
        sequenceNumber: 2,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.incidentEscalationV2StepEscalationApproval,
        workflowVersionId: WORKFLOW_SEED_IDS.incidentEscalationV2,
        stepKey: 'escalation-approval',
        displayName: 'Escalation Approval',
        description: 'Require explicit approval before high-severity escalation.',
        stepType: 'approval_gate',
        sequenceNumber: 3,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.changeApprovalV1StepReviewRequest,
        workflowVersionId: WORKFLOW_SEED_IDS.changeApprovalV1,
        stepKey: 'review-request',
        displayName: 'Review Request',
        description: 'Review the submitted change request and summarize operational risk.',
        stepType: 'human_task',
        sequenceNumber: 1,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.changeApprovalV1StepApprovalGate,
        workflowVersionId: WORKFLOW_SEED_IDS.changeApprovalV1,
        stepKey: 'approval-gate',
        displayName: 'Approval Gate',
        description: 'Require explicit approval before the requested change can proceed.',
        stepType: 'approval_gate',
        sequenceNumber: 2,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.runbookExecutionV1StepAiPreparation,
        workflowVersionId: WORKFLOW_SEED_IDS.runbookExecutionV1,
        stepKey: 'ai-preparation',
        displayName: 'AI Preparation',
        description: 'Use AI assistance to summarize the next operational procedure steps.',
        stepType: 'ai_task',
        sequenceNumber: 1,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
      {
        id: WORKFLOW_SEED_IDS.runbookExecutionV1StepToolExecution,
        workflowVersionId: WORKFLOW_SEED_IDS.runbookExecutionV1,
        stepKey: 'tool-execution',
        displayName: 'Tool Execution',
        description: 'Execute the controlled operational tool action.',
        stepType: 'tool_task',
        sequenceNumber: 2,
        isRequired: true,
        createdByActorId: WORKFLOW_SCOPE.createdByActorId,
        updatedByActorId: WORKFLOW_SCOPE.updatedByActorId,
      },
    ])
    .onConflictDoNothing({ target: workflowStepDefinitionsTable.id });
}
