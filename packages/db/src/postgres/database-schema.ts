import { assistantDefinitionsTable } from './schema/assistant-definitions.table.js';
import { assistantPublicationEventsTable } from './schema/assistant-publication-events.table.js';
import { assistantVersionsTable } from './schema/assistant-versions.table.js';
import { authorizationAuditEventsTable } from './schema/authorization-audit-events.table.js';
import { membershipsTable } from './schema/memberships.table.js';
import { tenantsTable } from './schema/tenants.table.js';
import { usersTable } from './schema/users.table.js';
import { workflowPublicationEventsTable } from './schema/workflow-publication-events.table.js';
import { workflowStepDefinitionsTable } from './schema/workflow-step-definitions.table.js';
import { workflowTemplatesTable } from './schema/workflow-templates.table.js';
import { workflowVersionsTable } from './schema/workflow-versions.table.js';
import { workspaceRoleScopesTable } from './schema/workspace-role-scopes.table.js';
import { workspaceRolesTable } from './schema/workspace-roles.table.js';
import { workspaceScopesTable } from './schema/workspace-scopes.table.js';
import { workspacesTable } from './schema/workspaces.table.js';

export const databaseSchema = {
  users: usersTable,
  tenants: tenantsTable,
  workspaces: workspacesTable,
  memberships: membershipsTable,
  workspaceRoles: workspaceRolesTable,
  workspaceScopes: workspaceScopesTable,
  workspaceRoleScopes: workspaceRoleScopesTable,
  authorizationAuditEvents: authorizationAuditEventsTable,
  assistantDefinitions: assistantDefinitionsTable,
  assistantVersions: assistantVersionsTable,
  assistantPublicationEvents: assistantPublicationEventsTable,
  workflowTemplates: workflowTemplatesTable,
  workflowVersions: workflowVersionsTable,
  workflowPublicationEvents: workflowPublicationEventsTable,
  workflowStepDefinitions: workflowStepDefinitionsTable,
};
