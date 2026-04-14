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
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_templates" ADD CONSTRAINT "workflow_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_versions" ADD CONSTRAINT "workflow_versions_workflow_template_id_workflow_templates_id_fk" FOREIGN KEY ("workflow_template_id") REFERENCES "public"."workflow_templates"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_templates_tenant_id_idx" ON "workflow_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workflow_templates_workspace_id_idx" ON "workflow_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_templates_workspace_slug_unique_idx" ON "workflow_templates" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "workflow_versions_template_id_idx" ON "workflow_versions" USING btree ("workflow_template_id");--> statement-breakpoint
CREATE INDEX "workflow_versions_lifecycle_status_idx" ON "workflow_versions" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_versions_template_version_unique_idx" ON "workflow_versions" USING btree ("workflow_template_id","version_number");