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
