CREATE TABLE "assistant_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"slug" varchar(120) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_publication_events" (
	"id" text PRIMARY KEY NOT NULL,
	"assistant_id" text NOT NULL,
	"assistant_slug" varchar(120) NOT NULL,
	"published_version_id" text NOT NULL,
	"published_version_number" integer NOT NULL,
	"deprecated_version_id" text,
	"deprecated_version_number" integer,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"assistant_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"lifecycle_status" varchar(40) NOT NULL,
	"model_key" varchar(120) NOT NULL,
	"system_instructions" text NOT NULL,
	"temperature" numeric(3, 2) NOT NULL,
	"max_output_tokens" integer NOT NULL,
	"change_summary" text NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authorization_audit_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"source" text NOT NULL,
	"correlation_id" text NOT NULL,
	"request_id" text,
	"diagnostic_id" text NOT NULL,
	"is_aligned" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"parity_report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_code" varchar(50) NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_publication_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_template_id" text NOT NULL,
	"workflow_slug" varchar(120) NOT NULL,
	"published_version_id" text NOT NULL,
	"published_version_number" integer NOT NULL,
	"deprecated_version_id" text,
	"deprecated_version_number" integer,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_step_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_version_id" text NOT NULL,
	"step_key" varchar(120) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"step_type" varchar(60) NOT NULL,
	"sequence_number" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"assistant_binding" varchar(120),
	"tool_binding" varchar(120),
	"approval_required" boolean DEFAULT false NOT NULL,
	"policy_key" varchar(160),
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"slug" varchar(120) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_template_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"lifecycle_status" varchar(40) NOT NULL,
	"trigger_mode" varchar(60) NOT NULL,
	"definition_summary" text NOT NULL,
	"change_summary" text NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_role_scopes" (
	"role_code" varchar(50) NOT NULL,
	"scope_code" varchar(80) NOT NULL,
	CONSTRAINT "workspace_role_scopes_role_code_scope_code_pk" PRIMARY KEY("role_code","scope_code")
);
--> statement-breakpoint
CREATE TABLE "workspace_roles" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"rank" integer NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_scopes" (
	"code" varchar(80) PRIMARY KEY NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"slug" varchar(80) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistant_definitions" ADD CONSTRAINT "assistant_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_definitions" ADD CONSTRAINT "assistant_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_assistant_id_assistant_definitions_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistant_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_published_version_id_assistant_versions_id_fk" FOREIGN KEY ("published_version_id") REFERENCES "public"."assistant_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_deprecated_version_id_assistant_versions_id_fk" FOREIGN KEY ("deprecated_version_id") REFERENCES "public"."assistant_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_versions" ADD CONSTRAINT "assistant_versions_assistant_id_assistant_definitions_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistant_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_code_workspace_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."workspace_roles"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_publication_events" ADD CONSTRAINT "workflow_publication_events_workflow_template_id_workflow_templates_id_fk" FOREIGN KEY ("workflow_template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_publication_events" ADD CONSTRAINT "workflow_publication_events_published_version_id_workflow_versions_id_fk" FOREIGN KEY ("published_version_id") REFERENCES "public"."workflow_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_publication_events" ADD CONSTRAINT "workflow_publication_events_deprecated_version_id_workflow_versions_id_fk" FOREIGN KEY ("deprecated_version_id") REFERENCES "public"."workflow_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_step_definitions" ADD CONSTRAINT "workflow_step_definitions_workflow_version_id_workflow_versions_id_fk" FOREIGN KEY ("workflow_version_id") REFERENCES "public"."workflow_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_template_id_workflow_templates_id_fk" FOREIGN KEY ("workflow_template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_role_scopes" ADD CONSTRAINT "workspace_role_scopes_role_code_workspace_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."workspace_roles"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_role_scopes" ADD CONSTRAINT "workspace_role_scopes_scope_code_workspace_scopes_code_fk" FOREIGN KEY ("scope_code") REFERENCES "public"."workspace_scopes"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "assistant_definitions_tenant_id_idx" ON "assistant_definitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "assistant_definitions_workspace_id_idx" ON "assistant_definitions" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assistant_definitions_workspace_slug_unique_idx" ON "assistant_definitions" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "assistant_publication_events_assistant_id_idx" ON "assistant_publication_events" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "assistant_publication_events_assistant_slug_idx" ON "assistant_publication_events" USING btree ("assistant_slug");--> statement-breakpoint
CREATE INDEX "assistant_publication_events_occurred_at_idx" ON "assistant_publication_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "assistant_versions_assistant_id_idx" ON "assistant_versions" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "assistant_versions_lifecycle_status_idx" ON "assistant_versions" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE UNIQUE INDEX "assistant_versions_assistant_version_unique_idx" ON "assistant_versions" USING btree ("assistant_id","version_number");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_created_at_idx" ON "authorization_audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_event_type_idx" ON "authorization_audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_source_idx" ON "authorization_audit_events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_correlation_id_idx" ON "authorization_audit_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_diagnostic_id_idx" ON "authorization_audit_events" USING btree ("diagnostic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_workspace_user_unique_idx" ON "memberships" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "memberships_tenant_id_idx" ON "memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "memberships_workspace_id_idx" ON "memberships" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "memberships_user_id_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memberships_role_code_idx" ON "memberships" USING btree ("role_code");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_is_active_idx" ON "tenants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "tenants_display_name_idx" ON "tenants" USING btree ("display_name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "users_display_name_idx" ON "users" USING btree ("display_name");--> statement-breakpoint
CREATE INDEX "workflow_publication_events_template_id_idx" ON "workflow_publication_events" USING btree ("workflow_template_id");--> statement-breakpoint
CREATE INDEX "workflow_publication_events_workflow_slug_idx" ON "workflow_publication_events" USING btree ("workflow_slug");--> statement-breakpoint
CREATE INDEX "workflow_publication_events_occurred_at_idx" ON "workflow_publication_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "workflow_step_definitions_workflow_version_id_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_step_definitions_version_sequence_unique_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id","sequence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_step_definitions_version_step_key_unique_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id","step_key");--> statement-breakpoint
CREATE INDEX "workflow_templates_tenant_id_idx" ON "workflow_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_workspace_id_idx" ON "workflow_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_templates_workspace_slug_unique_idx" ON "workflow_templates" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "workflow_versions_template_id_idx" ON "workflow_versions" USING btree ("workflow_template_id");--> statement-breakpoint
CREATE INDEX "workflow_versions_lifecycle_status_idx" ON "workflow_versions" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_versions_template_version_unique_idx" ON "workflow_versions" USING btree ("workflow_template_id","version_number");--> statement-breakpoint
CREATE INDEX "workspace_role_scopes_role_code_idx" ON "workspace_role_scopes" USING btree ("role_code");--> statement-breakpoint
CREATE INDEX "workspace_role_scopes_scope_code_idx" ON "workspace_role_scopes" USING btree ("scope_code");--> statement-breakpoint
CREATE INDEX "workspace_roles_rank_idx" ON "workspace_roles" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "workspace_roles_is_system_idx" ON "workspace_roles" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "workspace_scopes_is_system_idx" ON "workspace_scopes" USING btree ("is_system");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_tenant_slug_unique_idx" ON "workspaces" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "workspaces_tenant_id_idx" ON "workspaces" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workspaces_is_active_idx" ON "workspaces" USING btree ("is_active");