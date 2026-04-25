# Identity Access Service

## Purpose

The Identity Access Service is the first backend service bootstrap for OpsPilot AI.

At this stage, the service provides:

- service startup and runtime lifecycle
- health check endpoint
- standardized JSON responses
- structured logging
- graceful shutdown behavior
- database connectivity
- seed-backed identity read endpoints
- first access context resolution
- a clean backend service template for future services
- first RBAC primitives based on workspace role comparison
- first capability-level permission checks derived from role scopes
- persisted workspace role and scope catalog foundation
- normalized membership role references
- startup authorization catalog parity validation between runtime and persisted catalog
- visible authorization parity diagnostics endpoint
- manual runtime revalidation hook for authorization parity
- protected diagnostics endpoints with differentiated
- read and revalidation access
- stale-state signaling for runtime authorization parity diagnostics
- persisted append-only authorization diagnostics event history foundation
- correlation-ready authorization diagnostics and audit events
- filtered investigation-oriented history views for authorization audit events
- direct investigation lookup endpoints for diagnostic and correlation identifiers
- stitched investigation views for correlated authorization diagnostic flows
- operator-friendly timeline views for authorization investigations
- assistant definition and assistant version persistence foundation
- seeded assistant catalog with enriched assistant plus versions read model
- assistant version lifecycle primitives and published version resolution foundation
- assistant version lifecycle invariants and consistency checks
- assistant publish eligibility checks and publication readiness diagnostics
- assistant publication operation and controlled draft-to-published transition foundation
- assistant publication audit trail and publication transition diagnostics
- workflow template and workflow version persistence foundation
- seeded workflow catalog with enriched workflow plus versions read model
- workflow version lifecycle primitives and published version resolution foundation
- workflow version lifecycle invariants and consistency checks
- workflow publish eligibility checks and publication readiness diagnostics
- workflow publication operation and controlled draft-to-published transition foundation
- workflow publication audit trail and workflow publication transition diagnostics
- workflow step definition foundation and versioned workflow structure primitives
- workflow step policy surface and assistant/tool binding primitives
- Workflow steps now expose first execution-intent bindings, including assistant binding, tool binding, approval requirement, and step-level policy surface.
- workflow step validation rules and step binding consistency checks
- workflow publication blocking rules based on step consistency and version structure quality
- Workflow publication readiness now includes step-structure consistency as a blocking quality gate.
- workflow step registry alignment checks for assistant and tool bindings
- workflow run aggregate foundation and runtime execution state model
- workflow run step execution record foundation
- workflow run start / complete / fail transition primitives
- workflow run step start / complete / fail transition primitives
- workflow run step start / complete / fail transition primitives
- deterministic next-step activation and workflow progression primitives
- approval-gate runtime blocking and approval request aggregate foundation
- approval decision transitions and workflow unblocking primitives
- workflow run operational read model and timeline inspection foundation
- workflow runtime event log foundation and execution timeline projection
- workflow run invariant checks and runtime consistency diagnostics
- workflow execution engine loop foundation and command-driven runtime progression
- workflow execution engine drain mode and bounded auto-progression
- workflow execution engine safeguards and command eligibility diagnostics

The authorization parity history endpoint now reads persisted diagnostic events from durable storage.

Authorization diagnostics and persisted audit events now include explicit correlation identifiers and diagnostic identifiers to support future investigation flows.

The local seed now includes workflow templates and workflow versions for realistic workflow configuration demonstrations.

Completing a run step now deterministically activates the next pending step, or completes the workflow run when the completed step is the last one.

## Bootstrap Safety Checks

At startup, the service validates that the runtime authorization catalog matches the persisted workspace authorization catalog.

The service will fail fast if:

- a runtime role is missing in the database
- a runtime scope is missing in the database
- a runtime role-to-scope mapping is missing in the database
- unexpected persisted catalog entries create a parity mismatch

## Current Endpoints

### `GET /`

Returns a basic service status response.

### `GET /health`

Returns a health response that includes database readiness status.

- `200` when the database is reachable
- `500` when the database check fails

### `GET /access-context/resolve?email=...&tenantSlug=...&workspaceSlug=...`

Resolves the first access context object for a user in a specific tenant and workspace scope.

### `GET /workspace-access/check?email=...&tenantSlug=...&workspaceSlug=...&requiredRole=...`

Checks whether a resolved actor has at least the required workspace role in the target workspace.

### `GET /workspace-capabilities/check?email=...&tenantSlug=...&workspaceSlug=...&requiredScope=...`

Checks whether a resolved actor has a specific workspace scope derived from the role catalog.

### `GET /protected/workspace-admin`

A demonstration protected route that requires actor context headers and the `workspace.admin` scope.

### `GET /diagnostics/authorization-parity/history`

Returns persisted authorization parity audit events using investigation-oriented filters.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

Supported query parameters:

- `limit`
- `eventType`
- `source`
- `correlationId`
- `diagnosticId`

### `GET /authorization/workspace-catalog`

Returns the persisted workspace authorization catalog, including roles, scopes, and role-to-scope mappings.

### `POST /diagnostics/authorization-parity/revalidate`

Triggers a manual runtime revalidation of authorization catalog parity and updates the in-memory diagnostic state.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.admin`

### `GET /diagnostics/authorization-parity/by-diagnostic-id?diagnosticId=...`

Returns persisted authorization audit events associated with a specific diagnostic identifier.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /diagnostics/authorization-parity/by-correlation-id?correlationId=...`

Returns persisted authorization audit events associated with a specific correlation identifier.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /diagnostics/authorization-parity/investigation/by-diagnostic-id?diagnosticId=...`

Returns an aggregated investigation view for a specific diagnostic identifier.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /diagnostics/authorization-parity/investigation/by-correlation-id?correlationId=...`

Returns an aggregated investigation view for a specific correlation identifier.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /diagnostics/authorization-parity/timeline/by-diagnostic-id?diagnosticId=...`

Returns an operator-friendly timeline view for a specific authorization diagnostic.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /diagnostics/authorization-parity/timeline/by-correlation-id?correlationId=...`

Returns an operator-friendly timeline view for a specific correlated authorization flow.

Required headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

Required capability:

- `workspace.members.read`

### `GET /assistants`

Returns all assistant definitions currently stored in the service.

### `GET /assistants/by-slug?slug=...`

Returns a single assistant definition by slug.

### `GET /assistants/versions?assistantId=...`

Returns all versions for a specific assistant definition.

### `GET /assistants/with-versions?slug=...`

Returns an assistant definition together with all persisted versions.

### `GET /assistants/published-version?slug=...`

Returns the currently resolved published version for a specific assistant definition.

### `GET /assistants/version-consistency?slug=...`

Returns the lifecycle consistency check for a specific assistant definition.

### `GET /assistants/publish-readiness?slug=...&versionNumber=...`

Returns the publication readiness diagnostic for a specific assistant version.

### `POST /assistants/publish?slug=...&versionNumber=...`

Promotes a draft assistant version to published and deprecates the previously published version when applicable.

### `GET /workflows/published-version?slug=...`

Returns the currently resolved published version for a specific workflow template.

### `GET /workflows/version-consistency?slug=...`

Returns the lifecycle consistency check for a specific workflow template.

### `GET /workflows/publish-readiness?slug=...&versionNumber=...`

Returns the publication readiness diagnostic for a specific workflow version.

### `GET /assistants/publication-history?slug=...`

Returns the persisted publication history for a specific assistant definition.

### `GET /assistants/latest-publication?slug=...`

Returns the latest persisted publication event for a specific assistant definition.

### `GET /workflows`

Returns all workflow templates currently stored in the service.

### `GET /workflows/by-slug?slug=...`

Returns a single workflow template by slug.

### `GET /workflows/versions?workflowTemplateId=...`

Returns all versions for a specific workflow template.

### `POST /workflows/publish?slug=...&versionNumber=...`

Promotes a draft workflow version to published and deprecates the previously published version when applicable.

### `GET /workflows/publication-history?slug=...`

Returns the persisted publication history for a specific workflow template.

### `GET /workflows/latest-publication?slug=...`

Returns the latest persisted publication event for a specific workflow template.

### `GET /workflows/version-steps?workflowVersionId=...`

Returns all step definitions for a specific workflow version.

### `GET /workflows/version-structure?slug=...&versionNumber=...`

Returns the workflow template, workflow version, and ordered step definitions for a specific workflow version.

### `GET /workflows/step-consistency?slug=...&versionNumber=...`

Returns the structural consistency diagnostic for the steps of a specific workflow version.

### `GET /workflows/step-registry-alignment?slug=...&versionNumber=...`

Returns workflow step consistency enriched with assistant and tool registry alignment checks.

### `POST /workflow-runs?slug=...&workspaceId=...`

Creates a workflow run from the currently published version of a workflow template.

### `GET /workflow-runs/steps?runId=...`

Returns the persisted step execution records for a specific workflow run.

### `POST /workflow-runs/start?runId=..`

Transitions a workflow run from `pending` to `running`.

### `POST /workflow-runs/complete?runId=...`

Transitions a workflow run from `running` to `completed`.

### `POST /workflow-runs/fail?runId=...`

Transitions a workflow run from `running` to `failed`.

### `POST /workflow-runs/steps/start?runStepId=...`

Transitions a workflow run step from `ready` to `running`.

### `POST /workflow-runs/steps/complete?runStepId=...`

Transitions a workflow run step from `running` to `completed`.

### `POST /workflow-runs/steps/fail?runStepId=...`

Transitions a workflow run step from `running` to `failed`.

### `POST /workflow-runs/steps/start?runStepId=...`

Transitions a workflow run step from `ready` to `running`.

### `POST /workflow-runs/steps/complete?runStepId=...`

Transitions a workflow run step from `running` to `completed`.

### `POST /workflow-runs/steps/fail?runStepId=...`

Transitions a workflow run step from `running` to `failed`.

### `GET /approval-requests?workflowRunId=...`

Returns the approval requests associated with a specific workflow run.

### `POST /approval-requests/approve?approvalRequestId=...`

Approves a pending approval request and unblocks the associated workflow run step.

### `POST /approval-requests/reject?approvalRequestId=...`

Rejects a pending approval request and fails the associated workflow run.

### `GET /workflow-runs/operational-view?runId=...`

Returns a workflow run operational view including the run, its run steps, approval requests, and status summary.

### `GET /workflow-runs/timeline?runId=...`

Returns the append-only runtime event timeline for a workflow run.

### `GET /workflow-runs/diagnostics?runId=...`

Returns runtime consistency diagnostics for a workflow run, including invariant violations and summary counts.

### `POST /workflow-runs/advance?runId=...`

Executes one deterministic runtime engine advancement command for a workflow run.

### `POST /workflow-runs/drain?runId=...&maxCommands=...`

Runs bounded workflow engine auto-progression until approval wait, terminal state, no-op, or command limit.

### `GET /workflow-runs/engine-diagnostics?runId=...`

Returns command eligibility diagnostics for the workflow execution engine.

## Current Assistant Publication Operation

The service now supports a first governed assistant publication operation.

The current transition model:

- promotes a target `draft` version to `published`
- deprecates the previously published version when one exists

This is the first mutation foundation for a governed published configuration model.

## Actor Context Headers

Protected routes currently expect the following request headers:

- `x-actor-email`
- `x-tenant-slug`
- `x-workspace-slug`

These headers are currently used as a development-stage actor context transport mechanism before real authentication is introduced.

## Local Development

### Start the service

```bash
pnpm --filter identity-access-service dev
```

## Local Seed Data

A local identity foundation seed is available.

From the repository root:

```bash
pnpm db:seed:identity
```

## Local Seed Dataset

The initial local seed provides:

### Users

- `alice@acme.test`
- `bob@acme.test`

### Tenant

- `acme`

### Workspaces

- `operations`
- `security`

### Membership examples

- Alice is `workspace_admin` in `operations`
- Bob is `workspace_viewer` in `security`

This dataset exists to support local development and early identity resolution endpoints.
