CREATE TABLE "workflow_step_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_version_id" text NOT NULL,
	"step_key" varchar(120) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"step_type" varchar(60) NOT NULL,
	"sequence_number" integer NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_by_actor_id" text,
	"updated_by_actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_step_definitions" ADD CONSTRAINT "workflow_step_definitions_workflow_version_id_workflow_versions_id_fk" FOREIGN KEY ("workflow_version_id") REFERENCES "public"."workflow_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_step_definitions_workflow_version_id_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_step_definitions_version_sequence_unique_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id","sequence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "workflow_step_definitions_version_step_key_unique_idx" ON "workflow_step_definitions" USING btree ("workflow_version_id","step_key");