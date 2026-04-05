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
