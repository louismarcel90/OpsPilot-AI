ALTER TABLE "workflow_step_definitions" ADD COLUMN "assistant_binding" varchar(120);--> statement-breakpoint
ALTER TABLE "workflow_step_definitions" ADD COLUMN "tool_binding" varchar(120);--> statement-breakpoint
ALTER TABLE "workflow_step_definitions" ADD COLUMN "approval_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workflow_step_definitions" ADD COLUMN "policy_key" varchar(160);