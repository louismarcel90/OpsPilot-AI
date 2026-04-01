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
