CREATE TABLE "approval_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_run_id" text NOT NULL,
	"workflow_run_step_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"status" varchar(40) NOT NULL,
	"requested_at" timestamp with time zone NOT NULL,
	"decided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_run_id_workflow_runs_id_fk" FOREIGN KEY ("workflow_run_id") REFERENCES "public"."workflow_runs"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workflow_run_step_id_workflow_run_steps_id_fk" FOREIGN KEY ("workflow_run_step_id") REFERENCES "public"."workflow_run_steps"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "approval_requests_workflow_run_id_idx" ON "approval_requests" USING btree ("workflow_run_id");--> statement-breakpoint
CREATE INDEX "approval_requests_workflow_run_step_id_idx" ON "approval_requests" USING btree ("workflow_run_step_id");--> statement-breakpoint
CREATE INDEX "approval_requests_workspace_id_idx" ON "approval_requests" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "approval_requests_status_idx" ON "approval_requests" USING btree ("status");