ALTER TABLE "account_offline_token" DROP CONSTRAINT "account_offline_token_account_id_account_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_account" DROP CONSTRAINT "organization_account_account_id_account_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_offline_token" ADD CONSTRAINT "account_offline_token_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_account" ADD CONSTRAINT "organization_account_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
