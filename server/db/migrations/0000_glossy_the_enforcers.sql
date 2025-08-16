CREATE TYPE "public"."record_condition" AS ENUM('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor');--> statement-breakpoint
CREATE TYPE "public"."record_type" AS ENUM('LP', 'Single', 'EP');--> statement-breakpoint
CREATE TABLE "vinyl_vault_play_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "vinyl_vault_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"username" varchar(50),
	"image_url" text,
	"is_public" boolean DEFAULT false,
	"discogs_username" varchar(100),
	"discogs_access_token" text,
	"discogs_token_secret" text,
	"discogs_sync_enabled" boolean DEFAULT false,
	"last_discogs_sync" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vinyl_vault_users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "vinyl_vault_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vinyl_vault_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"artist" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"label" varchar(255),
	"catalog_number" varchar(100),
	"release_year" integer,
	"genre" varchar(100),
	"type" "record_type" DEFAULT 'LP' NOT NULL,
	"condition" "record_condition" DEFAULT 'Very Good',
	"notes" text,
	"image_url" text,
	"purchase_price" integer,
	"purchase_date" timestamp,
	"is_wishlist" boolean DEFAULT false,
	"rating" integer,
	"play_count" integer DEFAULT 0,
	"last_played_at" timestamp,
	"discogs_release_id" varchar(50),
	"discogs_master_id" varchar(50),
	"discogs_instance_id" varchar(50),
	"last_discogs_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vinyl_vault_play_history" ADD CONSTRAINT "vinyl_vault_play_history_record_id_vinyl_vault_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."vinyl_vault_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_play_history" ADD CONSTRAINT "vinyl_vault_play_history_user_id_vinyl_vault_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vinyl_vault_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_records" ADD CONSTRAINT "vinyl_vault_records_user_id_vinyl_vault_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vinyl_vault_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "record_id_idx" ON "vinyl_vault_play_history" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "play_history_user_id_idx" ON "vinyl_vault_play_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "username_idx" ON "vinyl_vault_users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "discogs_username_idx" ON "vinyl_vault_users" USING btree ("discogs_username");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "vinyl_vault_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "artist_idx" ON "vinyl_vault_records" USING btree ("artist");--> statement-breakpoint
CREATE INDEX "type_idx" ON "vinyl_vault_records" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wishlist_idx" ON "vinyl_vault_records" USING btree ("is_wishlist");--> statement-breakpoint
CREATE INDEX "discogs_release_idx" ON "vinyl_vault_records" USING btree ("discogs_release_id");--> statement-breakpoint
CREATE INDEX "discogs_instance_idx" ON "vinyl_vault_records" USING btree ("discogs_instance_id");