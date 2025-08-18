import { sql } from "@vercel/postgres";

async function applyMigration() {
  console.log("Applying migration for new image and listening features...");
  
  try {
    // Add new columns to vinyl_vault_records
    console.log("Adding image columns...");
    await sql`ALTER TABLE vinyl_vault_records ADD COLUMN IF NOT EXISTS cover_image_url text`;
    await sql`ALTER TABLE vinyl_vault_records ADD COLUMN IF NOT EXISTS back_cover_url text`;
    await sql`ALTER TABLE vinyl_vault_records ADD COLUMN IF NOT EXISTS label_image_url text`;
    await sql`ALTER TABLE vinyl_vault_records ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}'`;
    console.log("✅ Image columns added");

    // Create new tables
    console.log("Creating guest comments table...");
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_guest_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        record_id uuid NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
        collection_owner_id uuid NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        guest_name varchar(255) NOT NULL,
        guest_email varchar(255),
        comment text NOT NULL,
        rating integer CHECK (rating >= 1 AND rating <= 5),
        approved boolean DEFAULT true,
        hidden boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ Guest comments table created");

    console.log("Creating listening logs table...");
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_listening_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        record_id uuid NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        played_at timestamp DEFAULT now() NOT NULL,
        mood varchar(100),
        location varchar(255),
        weather varchar(100),
        occasion varchar(255),
        turntable varchar(255),
        cartridge varchar(255),
        amplifier varchar(255),
        speakers varchar(255),
        headphones varchar(255),
        pre_clean boolean DEFAULT false,
        condition_notes text,
        notes text,
        favorite_tracks text[] DEFAULT '{}',
        rating integer CHECK (rating >= 1 AND rating <= 5),
        guests text[] DEFAULT '{}',
        shared_to_social boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ Listening logs table created");

    console.log("Creating now spinning table...");
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_now_spinning (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        record_id uuid REFERENCES vinyl_vault_records(id) ON DELETE SET NULL,
        is_active boolean DEFAULT true,
        started_at timestamp DEFAULT now() NOT NULL,
        side varchar(10),
        queue_record_ids uuid[] DEFAULT '{}',
        show_lyrics boolean DEFAULT false,
        show_notes boolean DEFAULT true,
        auto_advance boolean DEFAULT false,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ Now spinning table created");

    // Create indexes
    console.log("Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS guest_comments_record_idx ON vinyl_vault_guest_comments USING btree (record_id)`;
    await sql`CREATE INDEX IF NOT EXISTS guest_comments_owner_idx ON vinyl_vault_guest_comments USING btree (collection_owner_id)`;
    await sql`CREATE INDEX IF NOT EXISTS guest_comments_created_idx ON vinyl_vault_guest_comments USING btree (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS listening_logs_record_idx ON vinyl_vault_listening_logs USING btree (record_id)`;
    await sql`CREATE INDEX IF NOT EXISTS listening_logs_user_idx ON vinyl_vault_listening_logs USING btree (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS listening_logs_played_at_idx ON vinyl_vault_listening_logs USING btree (played_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS now_spinning_user_idx ON vinyl_vault_now_spinning USING btree (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS now_spinning_active_idx ON vinyl_vault_now_spinning USING btree (is_active)`;
    console.log("✅ Indexes created");

    console.log("\n✨ Migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
applyMigration().then(() => {
  console.log("\n🎉 Database is ready!");
  process.exit(0);
}).catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});