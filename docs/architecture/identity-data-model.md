# Identity Data Model

## Purpose

This document defines the initial persistence foundation for identity, tenant, workspace, and membership modeling in OpsPilot AI.

## Initial Tables

### `users`

Represents a human actor known to the platform.

Initial fields:

- `id`
- `email`
- `display_name`
- `is_active`
- `created_at`
- `updated_at`

### `tenants`

Represents an organization boundary.

Initial fields:

- `id`
- `slug`
- `display_name`
- `is_active`
- `created_by_actor_id`
- `updated_by_actor_id`
- `created_at`
- `updated_at`

### `workspaces`

Represents an operational scope inside a tenant.

Initial fields:

- `id`
- `tenant_id`
- `slug`
- `display_name`
- `is_active`
- `created_by_actor_id`
- `updated_by_actor_id`
- `created_at`
- `updated_at`

A workspace belongs to exactly one tenant.

### `memberships`

Represents a user’s role assignment inside a workspace.

Initial fields:

- `id`
- `tenant_id`
- `workspace_id`
- `user_id`
- `role_code`
- `created_by_actor_id`
- `updated_by_actor_id`
- `created_at`
- `updated_at`

## Current Modeling Decisions

### Explicit tenant reference on memberships

`memberships` stores both `tenant_id` and `workspace_id`.

This is intentionally redundant at first glance, but useful for:

- explicit tenant isolation
- simplified filtering
- future policy evaluation inputs
- investigation clarity

### Role code stored as string

`role_code` is currently a string field.
The dedicated RBAC role model will be introduced in later steps.

### No soft delete yet

Soft delete is intentionally deferred.
The current goal is to establish a minimal, clean, enforceable structure first.

## Future Additions

Later steps are expected to add:

- tenant roles
- workspace trust modes
- invitation flows
- authentication identities
- session models
- role and scope catalogs
- audit evidence linkage
