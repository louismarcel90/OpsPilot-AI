CREATE TABLE "workspace_role_scopes" (
	"role_code" varchar(50) NOT NULL,
	"scope_code" varchar(80) NOT NULL,
	CONSTRAINT "workspace_role_scopes_role_code_scope_code_pk" PRIMARY KEY("role_code","scope_code")
);
--> statement-breakpoint
CREATE TABLE "workspace_roles" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"rank" integer NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_scopes" (
	"code" varchar(80) PRIMARY KEY NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"is_system" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspace_role_scopes" ADD CONSTRAINT "workspace_role_scopes_role_code_workspace_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."workspace_roles"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_role_scopes" ADD CONSTRAINT "workspace_role_scopes_scope_code_workspace_scopes_code_fk" FOREIGN KEY ("scope_code") REFERENCES "public"."workspace_scopes"("code") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workspace_role_scopes_role_code_idx" ON "workspace_role_scopes" USING btree ("role_code");--> statement-breakpoint
CREATE INDEX "workspace_role_scopes_scope_code_idx" ON "workspace_role_scopes" USING btree ("scope_code");--> statement-breakpoint
CREATE INDEX "workspace_roles_rank_idx" ON "workspace_roles" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "workspace_roles_is_system_idx" ON "workspace_roles" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "workspace_scopes_is_system_idx" ON "workspace_scopes" USING btree ("is_system");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_code_workspace_roles_code_fk" FOREIGN KEY ("role_code") REFERENCES "public"."workspace_roles"("code") ON DELETE restrict ON UPDATE cascade;