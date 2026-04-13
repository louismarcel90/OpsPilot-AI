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
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_assistant_id_assistant_definitions_id_fk" FOREIGN KEY ("assistant_id") REFERENCES "public"."assistant_definitions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_published_version_id_assistant_versions_id_fk" FOREIGN KEY ("published_version_id") REFERENCES "public"."assistant_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "assistant_publication_events" ADD CONSTRAINT "assistant_publication_events_deprecated_version_id_assistant_versions_id_fk" FOREIGN KEY ("deprecated_version_id") REFERENCES "public"."assistant_versions"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "assistant_publication_events_assistant_id_idx" ON "assistant_publication_events" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "assistant_publication_events_assistant_slug_idx" ON "assistant_publication_events" USING btree ("assistant_slug");--> statement-breakpoint
CREATE INDEX "assistant_publication_events_occurred_at_idx" ON "assistant_publication_events" USING btree ("occurred_at");