# Identity Access Service

## Purpose

The Identity Access Service is the first backend service bootstrap for OpsPilot AI.

At this stage, it provides:

- service startup and runtime lifecycle
- health check endpoint
- standardized JSON responses
- structured logging
- graceful shutdown behavior
- a clean service template for future backend services

It does **not** yet provide:

- authentication
- authorization
- tenant resolution
- workspace resolution
- RBAC enforcement
- identity persistence

Those capabilities will be added in later steps.

## Current Endpoints

### `GET /`

Returns a basic service status response.

### `GET /health`

Returns a health response that includes database readiness status.

- `200` when the database is reachable
- `500` when the database check fails

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
