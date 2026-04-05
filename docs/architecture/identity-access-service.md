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
