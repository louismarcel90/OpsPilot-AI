ALTER TABLE "authorization_audit_events" ADD COLUMN "correlation_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "authorization_audit_events" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "authorization_audit_events" ADD COLUMN "diagnostic_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "authorization_audit_events_correlation_id_idx" ON "authorization_audit_events" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "authorization_audit_events_diagnostic_id_idx" ON "authorization_audit_events" USING btree ("diagnostic_id");