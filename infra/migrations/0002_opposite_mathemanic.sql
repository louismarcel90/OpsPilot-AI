CREATE TABLE "workflow_run_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_run_id" text NOT NULL,
	"workflow_step_definition_id" text NOT NULL,
	"sequence_number" integer NOT NULL,
	"status" varchar(40) NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_run_steps" ADD CONSTRAINT "workflow_run_steps_workflow_step_definition_id_workflow_step_definitions_id_fk" FOREIGN KEY ("workflow_step_definition_id") REFERENCES "public"."workflow_step_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_run_steps_workflow_run_id_idx" ON "workflow_run_steps" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "workflow_run_steps_workflow_step_definition_id_idx" ON "workflow_run_steps" USING btree ("workflow_step_definition_id");--> statement-breakpoint
CREATE INDEX "workflow_run_steps_status_idx" ON "workflow_run_steps" USING btree ("status");