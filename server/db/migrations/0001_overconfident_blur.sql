CREATE TABLE "vinyl_vault_guest_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"collection_owner_id" uuid NOT NULL,
	"guest_name" varchar(255) NOT NULL,
	"guest_email" varchar(255),
	"comment" text NOT NULL,
	"rating" integer,
	"approved" boolean DEFAULT true,
	"hidden" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vinyl_vault_listening_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"played_at" timestamp DEFAULT now() NOT NULL,
	"mood" varchar(100),
	"location" varchar(255),
	"weather" varchar(100),
	"occasion" varchar(255),
	"turntable" varchar(255),
	"cartridge" varchar(255),
	"amplifier" varchar(255),
	"speakers" varchar(255),
	"headphones" varchar(255),
	"pre_clean" boolean DEFAULT false,
	"condition_notes" text,
	"notes" text,
	"favorite_tracks" text[] DEFAULT '{}',
	"rating" integer,
	"guests" text[] DEFAULT '{}',
	"shared_to_social" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vinyl_vault_now_spinning" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"record_id" uuid,
	"is_active" boolean DEFAULT true,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"side" varchar(10),
	"queue_record_ids" uuid[] DEFAULT '{}',
	"show_lyrics" boolean DEFAULT false,
	"show_notes" boolean DEFAULT true,
	"auto_advance" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vinyl_vault_records" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "vinyl_vault_records" ADD COLUMN "back_cover_url" text;--> statement-breakpoint
ALTER TABLE "vinyl_vault_records" ADD COLUMN "label_image_url" text;--> statement-breakpoint
ALTER TABLE "vinyl_vault_records" ADD COLUMN "additional_images" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "vinyl_vault_guest_comments" ADD CONSTRAINT "vinyl_vault_guest_comments_record_id_vinyl_vault_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."vinyl_vault_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_guest_comments" ADD CONSTRAINT "vinyl_vault_guest_comments_collection_owner_id_vinyl_vault_users_id_fk" FOREIGN KEY ("collection_owner_id") REFERENCES "public"."vinyl_vault_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_listening_logs" ADD CONSTRAINT "vinyl_vault_listening_logs_record_id_vinyl_vault_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."vinyl_vault_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_listening_logs" ADD CONSTRAINT "vinyl_vault_listening_logs_user_id_vinyl_vault_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vinyl_vault_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_now_spinning" ADD CONSTRAINT "vinyl_vault_now_spinning_user_id_vinyl_vault_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vinyl_vault_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vinyl_vault_now_spinning" ADD CONSTRAINT "vinyl_vault_now_spinning_record_id_vinyl_vault_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."vinyl_vault_records"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guest_comments_record_idx" ON "vinyl_vault_guest_comments" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "guest_comments_owner_idx" ON "vinyl_vault_guest_comments" USING btree ("collection_owner_id");--> statement-breakpoint
CREATE INDEX "guest_comments_created_idx" ON "vinyl_vault_guest_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "listening_logs_record_idx" ON "vinyl_vault_listening_logs" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "listening_logs_user_idx" ON "vinyl_vault_listening_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "listening_logs_played_at_idx" ON "vinyl_vault_listening_logs" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "now_spinning_user_idx" ON "vinyl_vault_now_spinning" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "now_spinning_active_idx" ON "vinyl_vault_now_spinning" USING btree ("is_active");