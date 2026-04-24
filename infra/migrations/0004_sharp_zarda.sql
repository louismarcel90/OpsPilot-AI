CREATE TABLE "workflow_runtime_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_run_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"event_type" varchar(120) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workflow_runtime_events" ADD CONSTRAINT "workflow_runtime_events_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workflow_runtime_events" ADD CONSTRAINT "workflow_runtime_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workflow_runtime_events_workflow_run_id_idx" ON "workflow_runtime_events" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "workflow_runtime_events_workspace_id_idx" ON "workflow_runtime_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workflow_runtime_events_occurred_at_idx" ON "workflow_runtime_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "workflow_runtime_events_event_type_idx" ON "workflow_runtime_events" USING btree ("event_type");