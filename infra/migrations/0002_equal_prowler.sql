CREATE TABLE "authorization_audit_events" (
	"event_id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"source" text NOT NULL,
	"is_aligned" boolean NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"parity_report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "authorization_audit_events_created_at_idx" ON "authorization_audit_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_event_type_idx" ON "authorization_audit_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_source_idx" ON "authorization_audit_events" USING btree ("source");