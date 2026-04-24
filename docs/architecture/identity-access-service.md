# Identity Access Service

## Role in the System

The Identity Access Service is responsible for identity and access control concerns in OpsPilot AI.

In the current foundation stage, it acts as:

- the first backend service reference implementation
- the baseline runtime template for future services
- the initial platform-grade service skeleton

## Future Responsibilities

In later phases, this service will be responsible for:

- actor identity resolution
- session and authentication flows
- tenant membership resolution
- workspace access resolution
- RBAC and scoped permission checks
- trust mode resolution inputs

## Current Responsibilities

At the moment, the service only provides:

- service bootstrap
- root endpoint
- health endpoint
- structured logs
- graceful shutdown
- standardized HTTP responses

## Layering Model

### Domain

Contains foundational health-related types.

### Application

Contains health check response assembly.

### Presentation

Contains HTTP request handlers.

### Infrastructure

Contains router creation, HTTP server lifecycle, logging wiring, and runtime orchestration.

## Why This Exists Early

This service exists early because OpsPilot AI cannot support governed execution later without first establishing a clean backend service pattern.

The goal is to standardize service construction before adding identity-specific business logic.

## Current Access Context Capability

The service now supports a first access context resolution flow:

1. resolve actor by email
2. resolve tenant by slug
3. resolve workspace by tenant and workspace slug
4. resolve membership by workspace and actor
5. assemble an access context result

This is the first structural step toward future authorization, RBAC, and policy-aware execution.

## Current RBAC Foundation Capability

The service now includes a first RBAC foundation based on workspace roles.

Current workspace role catalog:

- `workspace_viewer`
- `workspace_operator`
- `workspace_admin`

Current access checks support:

- context resolution
- role validation
- minimum required role comparison

This is still a coarse-grained authorization model and does not yet include scopes or capability-level authorization.

## Current Permission Model Capability

The service now supports a first permission model based on role-derived scopes.

Current workspace scopes:

- `workspace.read`
- `workspace.operate`
- `workspace.members.read`
- `workspace.members.manage`
- `workspace.admin`

Current permission checks support:

- actor, tenant, and workspace context resolution
- membership role validation
- role-derived scope evaluation
- capability-level allow or deny decisions

This remains a coarse-grained permission model and is still narrower than the future policy decision layer.

## Current Protected Route Shape

The service now includes a first protected route pattern based on:

1. request context extraction
2. workspace header extraction
3. access context resolution
4. capability enforcement
5. protected handler execution

This establishes the shape that future protected routes can follow before the broader policy layer is introduced.

## Current Authorization Diagnostics Capability

Authorization decisions now include structured diagnostics.

These diagnostics make it possible to explain:

- why access was granted
- why access was denied
- what role was observed
- what scope was required
- what scopes were effectively granted

This prepares the service for future policy-oriented decision explanation.

## Current Persisted Authorization Catalog Capability

The service now relies on a persisted workspace authorization catalog model.

This includes:

- `workspace_roles`
- `workspace_scopes`
- `workspace_role_scopes`

The current runtime authorization logic remains code-driven, but memberships are now normalized against a persisted role catalog.

This is an important transition point between:

- code-defined authorization foundations
- future persisted and governable authorization control models

## Current Authorization Bootstrap Validation

The service now validates runtime and persisted authorization catalog parity at startup.

This validation checks:

- workspace roles
- workspace scopes
- workspace role-to-scope mappings

The service fails fast when parity is broken.

This improves startup safety and reduces the risk of silent authorization drift between:

- runtime code-based authorization assumptions
- persisted authorization catalog state

## Current Authorization Parity Visibility

The service now exposes the latest authorization parity diagnostic through a dedicated runtime endpoint.

This makes bootstrap validation observable after startup and provides a first operational visibility layer for authorization catalog consistency.

## Current Runtime Authorization Revalidation Capability

The service now supports manual runtime revalidation of authorization parity.

This allows the system to:

- recompute runtime versus persisted catalog parity
- refresh the in-memory diagnostic state
- distinguish bootstrap validation from manual revalidation

This is a foundational step toward more dynamic authorization catalog governance.

## Current Diagnostics Protection and Freshness Capability

Authorization parity diagnostics are now protected and freshness-aware.

The service now supports:

- protected read access for diagnostics
- stronger protected access for diagnostic revalidation
- availability signaling when no diagnostic exists
- freshness signaling to identify stale runtime state

This improves the operational credibility of the diagnostics layer and prepares it for future control-plane usage.

## Current Persisted Authorization Diagnostics History

The service now persists key authorization parity events in durable append-only storage.

This includes:

- bootstrap validation completion events
- manual revalidation completion events

This is the first durable storage foundation for future authorization investigation and audit capabilities.

## Current Authorization Correlation Foundation

Authorization diagnostics and persisted audit events now include explicit correlation identifiers.

This introduces a first traceable linkage between:

- runtime diagnostic state
- persisted authorization audit events
- request-triggered manual revalidations
- bootstrap validation flows

This is the first structural step toward a broader investigation graph across requests, decisions, diagnostics, and audit history.

## Current Investigation-Oriented Authorization History Views

The service now supports filtered authorization audit history queries.

Current history filters include:

- event type
- source
- correlation identifier
- diagnostic identifier

This improves investigation readiness by allowing operators to narrow history views to a targeted authorization flow or diagnostic lifecycle.

## Current Focused Investigation Reads

The service now supports direct investigation-oriented reads using:

- diagnostic identifier lookup
- correlation identifier lookup

This makes it possible to move from broad history exploration to focused inspection of a specific diagnostic lifecycle or a specific correlated authorization flow.

## Current Stitched Investigation Views

The service now supports stitched investigation-oriented views for:

- a specific diagnostic identifier
- a specific correlation identifier

These views aggregate persisted audit events and selected runtime context into a single investigation response, improving operator usability and investigation speed.

## Current Investigation Timeline Views

The service now supports timeline-oriented investigation views for authorization diagnostics and correlated flows.

These views transform persisted audit events into operator-friendly chronology entries, improving readability and making future UI investigation tooling easier to build.

## Current Assistant Definition and Version Foundation

The service now includes persisted assistant definitions and assistant versions.

This introduces a core separation between:

- a stable assistant identity
- a versioned assistant configuration

This is the first structural step toward published assistant configuration management.

## Current Assistant Seed and Enriched Read Capability

The service now includes seeded assistant definitions and seeded assistant versions.

It also supports an enriched read model that returns:

- a stable assistant definition
- all persisted versions attached to that assistant

This improves local demonstrability and prepares the service for future published assistant resolution.

## Current Assistant Lifecycle and Published Version Resolution

The service now includes first assistant version lifecycle primitives.

Supported lifecycle statuses:

- `draft`
- `published`
- `deprecated`

It also supports resolving the currently published version for a given assistant definition, which is a first step toward a governed published configuration model.

## Current Assistant Version Consistency Capability

The service now evaluates assistant version consistency using lifecycle invariants.

Current checks include:

- zero published version
- exactly one published version
- multiple published versions

This improves assistant configuration quality and prepares the service for future governed publish flows.

## Current Assistant Publication Readiness Capability

The service now evaluates whether a specific assistant version is eligible for publication.

Current readiness checks include:

- assistant existence
- version existence
- assistant active state
- lifecycle compatibility
- model key presence
- system instructions presence
- max output tokens validity
- temperature validity
- conflicting published version detection

This prepares the service for future governed publication flows.

## Current Assistant Publication Audit Trail

The service now persists assistant publication events.

Each publication event captures:

- the assistant identifier
- the assistant slug
- the published version
- the deprecated previously published version, when applicable
- the publication timestamp

This is the first durable traceability layer for assistant publication mutations.

## Current Workflow Template and Version Foundation

The service now includes persisted workflow templates and workflow versions.

This introduces a core separation between:

- a stable workflow identity
- a versioned workflow configuration

This is the first structural step toward governed workflow configuration and future workflow publication.

## Current Workflow Seed and Enriched Read Capability

The service now includes seeded workflow templates and seeded workflow versions.

It supports enriched reads that return:

- a stable workflow template
- all persisted versions attached to that workflow

This improves local demonstrability and prepares the service for future governed workflow publication.

## Current Workflow Lifecycle and Published Version Resolution

The service now includes first workflow version lifecycle primitives.

Supported lifecycle statuses:

- `draft`
- `published`
- `deprecated`

It also supports resolving the currently published version for a given workflow template, which is a first step toward a governed published workflow configuration model.

## Current Workflow Version Consistency Capability

The service now evaluates workflow version consistency using lifecycle invariants.

Current checks include:

- zero published version
- exactly one published version
- multiple published versions

This improves workflow configuration quality and prepares the service for future governed publish flows.

## Current Workflow Publication Readiness Capability

The service now evaluates whether a specific workflow version is eligible for publication.

Current readiness checks include:

- workflow existence
- version existence
- workflow active state
- lifecycle compatibility
- trigger mode presence
- definition summary presence
- conflicting published version detection

This prepares the service for future governed workflow publication flows.

## Current Workflow Publication Operation

The service now supports a first governed workflow publication operation.

The current transition model:

- promotes a target `draft` version to `published`
- deprecates the previously published version when one exists

This is the first mutation foundation for a governed published workflow configuration model.

## Current Workflow Publication Audit Trail

The service now persists workflow publication events.

Each workflow publication event captures:

- the workflow template identifier
- the workflow slug
- the published version
- the deprecated previously published version, when applicable
- the publication timestamp

This is the first durable traceability layer for workflow publication mutations.

## Current Workflow Step Definition Foundation

The service now includes workflow step definitions attached to workflow versions.

This introduces a first internal structure model for versioned workflows, including:

- ordered steps
- step types
- required step flags

This prepares the service for future execution-oriented workflow modeling.

## Current Workflow Step Execution Intent Foundation

The service now enriches workflow step definitions with a first execution-intent surface.

Each step may now expose:

- an assistant binding
- a tool binding
- an approval required flag
- a policy key

This is a first foundation for governed workflow step execution planning.

## Current Workflow Step Consistency Capability

The service now evaluates structural consistency rules for workflow steps.

Current checks include:

- AI steps require assistant bindings
- tool steps require tool bindings
- approval gates require approvalRequired=true
- incompatible bindings are flagged by step type

This prepares the service for stronger workflow publication and execution validation.

## Current Workflow Publication Quality Gate

The service now blocks workflow publication when step structure consistency checks fail.

This means workflow publication readiness now depends not only on version metadata, but also on the structural validity of the versioned workflow steps.

This is the first true workflow publication quality gate.

## Current Workflow Step Registry Alignment Capability

The service now validates workflow step bindings against known assistant slugs and known tool keys.

This introduces a first referential validation layer for:

- assistant bindings
- tool bindings

This strengthens workflow publication quality gates beyond structural validation.

## Current Workflow Run Runtime Foundation

The service now includes a workflow run aggregate.

A workflow run represents a real execution instance created from a published workflow version.

Current workflow run capabilities include:

- persisted workflow run creation
- runtime status representation
- linkage to a published workflow version

This is the first foundational runtime layer for governed workflow execution.

## Current Workflow Run Step Runtime Foundation

The service now includes workflow run step execution records.

Each run step record represents a projected runtime instance of a workflow step definition inside a specific workflow run.

Current capabilities include:

- persisted run step creation during workflow run creation
- runtime step status representation
- deterministic initialization of the first step as `ready`
- deterministic initialization of subsequent steps as `pending`

This is the first detailed runtime progression layer for governed workflow execution.

## Current Workflow Run Lifecycle Transitions

The service now supports first workflow run lifecycle transitions.

Currently supported transitions:

- `pending -> running`
- `running -> completed`
- `running -> failed`

This establishes the first governed runtime lifecycle model for workflow execution instances.

## Current Workflow Run Step Lifecycle Transitions

The service now supports first lifecycle transitions for workflow run steps.

Currently supported transitions:

- `ready -> running`
- `running -> completed`
- `running -> failed`

This establishes the first governed runtime lifecycle model for per-step workflow execution.

## Current Workflow Run Step Lifecycle Transitions

The service now supports first lifecycle transitions for workflow run steps.

Currently supported transitions:

- `ready -> running`
- `running -> completed`
- `running -> failed`

This establishes the first governed runtime lifecycle model for per-step workflow execution.

## Current Deterministic Workflow Progression Model

The service now supports deterministic next-step activation.

When a workflow run step completes:

- the next ordered pending step becomes `ready`
- or the workflow run is completed if there is no next step

When a workflow run step fails:

- the workflow run is failed

This establishes the first orchestration-grade progression model for workflow runtime execution.

## Current Approval-Gate Runtime Foundation

The service now supports runtime blocking for approval-gate workflow steps.

When deterministic workflow progression reaches an approval-gate step:

- the run step becomes `blocked`
- an approval request is persisted in `pending`

This is the first governed runtime approval foundation for workflow execution.

## Current Approval Decision Runtime

The service now supports approval request decision transitions.

Current approval decision behavior:

- approving a pending request marks it `approved`
- approving unblocks the associated workflow run step by marking it `ready`
- rejecting a pending request marks it `rejected`
- rejecting fails the associated workflow run

This closes the first governed runtime approval loop.

## Current Workflow Run Operational View

The service now exposes an operational read model for workflow runs.

The operational view includes:

- workflow run state
- ordered workflow run steps
- approval requests
- aggregated runtime summary counts

This is the first operator-facing runtime inspection foundation.

## Current Workflow Runtime Event Timeline

The service now persists append-only workflow runtime events.

Runtime events capture:

- workflow run creation and lifecycle transitions
- workflow run step lifecycle transitions
- approval request creation and decision transitions

This establishes the first execution timeline foundation for runtime investigation and audit.

## Current Workflow Run Runtime Diagnostics

The service now evaluates workflow run runtime invariants.

Current invariant checks include:

- at most one ready step in a sequential workflow run
- at most one running step in a sequential workflow run
- blocked steps must have approval requests
- completed runs must not contain incomplete steps
- failed runs must have a failure signal through a failed step or rejected approval request

This provides a first runtime consistency diagnostic layer for detecting invalid workflow execution states.
