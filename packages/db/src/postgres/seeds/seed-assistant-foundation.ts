import type { PostgresConnection } from '../create-postgres-connection.js';
import { assistantDefinitionsTable } from '../schema/assistant-definitions.table.js';
import { assistantVersionsTable } from '../schema/assistant-versions.table.js';

const ASSISTANT_SEED_IDS = {
  incidentTriageAssistant: 'asst_incident_triage_001',
  runbookAssistant: 'asst_runbook_ops_001',
  policyReviewAssistant: 'asst_policy_review_001',
  incidentTriageV1: 'asst_ver_incident_triage_001',
  incidentTriageV2: 'asst_ver_incident_triage_002',
  runbookV1: 'asst_ver_runbook_ops_001',
  policyReviewV1: 'asst_ver_policy_review_001',
} as const;

const ASSISTANT_SCOPE = {
  tenantId: 'ten_acme_001',
  workspaceId: 'wrk_ops_001',
  createdByActorId: 'usr_alice_001',
  updatedByActorId: 'usr_alice_001',
} as const;

export async function seedAssistantFoundation(connection: PostgresConnection): Promise<void> {
  await connection.db
    .insert(assistantDefinitionsTable)
    .values([
      {
        id: ASSISTANT_SEED_IDS.incidentTriageAssistant,
        tenantId: ASSISTANT_SCOPE.tenantId,
        workspaceId: ASSISTANT_SCOPE.workspaceId,
        slug: 'incident-triage-assistant',
        displayName: 'Incident Triage Assistant',
        description:
          'Helps operators classify incidents, identify severity signals, and propose first-response triage guidance.',
        isActive: true,
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
      {
        id: ASSISTANT_SEED_IDS.runbookAssistant,
        tenantId: ASSISTANT_SCOPE.tenantId,
        workspaceId: ASSISTANT_SCOPE.workspaceId,
        slug: 'operations-runbook-assistant',
        displayName: 'Operations Runbook Assistant',
        description:
          'Supports operators by suggesting runbook-aligned operational actions and summarizing relevant procedures.',
        isActive: true,
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
      {
        id: ASSISTANT_SEED_IDS.policyReviewAssistant,
        tenantId: ASSISTANT_SCOPE.tenantId,
        workspaceId: ASSISTANT_SCOPE.workspaceId,
        slug: 'policy-review-assistant',
        displayName: 'Policy Review Assistant',
        description:
          'Assists with policy interpretation, control review, and compliance-oriented reasoning support.',
        isActive: true,
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
    ])
    .onConflictDoNothing({ target: assistantDefinitionsTable.id });

  await connection.db
    .insert(assistantVersionsTable)
    .values([
      {
        id: ASSISTANT_SEED_IDS.incidentTriageV1,
        assistantId: ASSISTANT_SEED_IDS.incidentTriageAssistant,
        versionNumber: 1,
        lifecycleStatus: 'draft',
        modelKey: 'gpt-4.1',
        systemInstructions:
          'You are an incident triage assistant. Classify severity, extract operational signals, and provide structured triage guidance.',
        temperature: '0.20',
        maxOutputTokens: 1200,
        changeSummary: 'Initial incident triage assistant definition.',
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
      {
        id: ASSISTANT_SEED_IDS.incidentTriageV2,
        assistantId: ASSISTANT_SEED_IDS.incidentTriageAssistant,
        versionNumber: 2,
        lifecycleStatus: 'published',
        modelKey: 'gpt-4.1',
        systemInstructions:
          'You are a governed incident triage assistant. Classify severity, identify confidence signals, summarize probable impact, and produce concise triage recommendations.',
        temperature: '0.10',
        maxOutputTokens: 1400,
        changeSummary:
          'Improved severity framing, impact analysis, and governed response structure.',
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
      {
        id: ASSISTANT_SEED_IDS.runbookV1,
        assistantId: ASSISTANT_SEED_IDS.runbookAssistant,
        versionNumber: 1,
        lifecycleStatus: 'published',
        modelKey: 'gpt-4.1-mini',
        systemInstructions:
          'You are an operations runbook assistant. Recommend actions that stay aligned with approved operational procedures and avoid unsupported actions.',
        temperature: '0.10',
        maxOutputTokens: 1000,
        changeSummary: 'Initial published runbook support assistant.',
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
      {
        id: ASSISTANT_SEED_IDS.policyReviewV1,
        assistantId: ASSISTANT_SEED_IDS.policyReviewAssistant,
        versionNumber: 1,
        lifecycleStatus: 'draft',
        modelKey: 'gpt-4.1',
        systemInstructions:
          'You are a policy review assistant. Summarize policy intent, identify controls, and highlight ambiguities that require human review.',
        temperature: '0.05',
        maxOutputTokens: 1100,
        changeSummary: 'Initial policy review assistant definition.',
        createdByActorId: ASSISTANT_SCOPE.createdByActorId,
        updatedByActorId: ASSISTANT_SCOPE.updatedByActorId,
      },
    ])
    .onConflictDoNothing({ target: assistantVersionsTable.id });
}
