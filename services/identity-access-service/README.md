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

Returns a basic health check payload for the service.

## Local Development

### Start the service

```bash
pnpm --filter identity-access-service dev
```
