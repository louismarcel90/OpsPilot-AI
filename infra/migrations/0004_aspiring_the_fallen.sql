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
ALTER TABLE "assistant_definitions" ADD CONSTRAINT "assistant_definitions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_definitions" ADD CONSTRAINT "assistant_definitions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_versions" ADD CONSTRAINT "assistant_versions_assistant_id_assistant_definitions_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistant_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "assistant_definitions_tenant_id_idx" ON "assistant_definitions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "assistant_definitions_workspace_id_idx" ON "assistant_definitions" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assistant_definitions_workspace_slug_unique_idx" ON "assistant_definitions" USING btree ("workspace_id","slug");--> statement-breakpoint
CREATE INDEX "assistant_versions_assistant_id_idx" ON "assistant_versions" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "assistant_versions_lifecycle_status_idx" ON "assistant_versions" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE UNIQUE INDEX "assistant_versions_assistant_version_unique_idx" ON "assistant_versions" USING btree ("assistant_id","version_number");