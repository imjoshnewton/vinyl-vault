import { sql } from "@vercel/postgres";

async function runMigrations() {
  console.log("Running database migrations...");
  
  try {
    // Add new columns to vinyl_records table if they don't exist
    await sql`
      ALTER TABLE vinyl_vault_records 
      ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
      ADD COLUMN IF NOT EXISTS back_cover_url TEXT,
      ADD COLUMN IF NOT EXISTS label_image_url TEXT,
      ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';
    `;
    console.log("✅ Added image columns to vinyl_vault_records");
    
    // Create listening logs table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_listening_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        record_id UUID NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        played_at TIMESTAMP DEFAULT NOW() NOT NULL,
        mood VARCHAR(100),
        location VARCHAR(255),
        weather VARCHAR(100),
        occasion VARCHAR(255),
        turntable VARCHAR(255),
        cartridge VARCHAR(255),
        amplifier VARCHAR(255),
        speakers VARCHAR(255),
        headphones VARCHAR(255),
        pre_clean BOOLEAN DEFAULT FALSE,
        condition_notes TEXT,
        notes TEXT,
        favorite_tracks TEXT[] DEFAULT '{}',
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        guests TEXT[] DEFAULT '{}',
        shared_to_social BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✅ Created vinyl_vault_listening_logs table");
    
    // Create guest comments table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_guest_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        record_id UUID NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
        collection_owner_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255),
        comment TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        approved BOOLEAN DEFAULT TRUE,
        hidden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✅ Created vinyl_vault_guest_comments table");
    
    // Create now spinning table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_now_spinning (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        record_id UUID REFERENCES vinyl_vault_records(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        side VARCHAR(10),
        queue_record_ids UUID[] DEFAULT '{}',
        show_lyrics BOOLEAN DEFAULT FALSE,
        show_notes BOOLEAN DEFAULT TRUE,
        auto_advance BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    console.log("✅ Created vinyl_vault_now_spinning table");
    
    // Add indexes
    await sql`
      CREATE INDEX IF NOT EXISTS listening_logs_record_idx ON vinyl_vault_listening_logs(record_id);
      CREATE INDEX IF NOT EXISTS listening_logs_user_idx ON vinyl_vault_listening_logs(user_id);
      CREATE INDEX IF NOT EXISTS listening_logs_played_at_idx ON vinyl_vault_listening_logs(played_at DESC);
      CREATE INDEX IF NOT EXISTS guest_comments_record_idx ON vinyl_vault_guest_comments(record_id);
      CREATE INDEX IF NOT EXISTS guest_comments_owner_idx ON vinyl_vault_guest_comments(collection_owner_id);
      CREATE INDEX IF NOT EXISTS guest_comments_created_idx ON vinyl_vault_guest_comments(created_at DESC);
      CREATE INDEX IF NOT EXISTS now_spinning_user_idx ON vinyl_vault_now_spinning(user_id);
      CREATE INDEX IF NOT EXISTS now_spinning_active_idx ON vinyl_vault_now_spinning(is_active);
    `;
    console.log("✅ Created indexes");
    
    console.log("\n✨ All migrations completed successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations
runMigrations().then(() => {
  console.log("Done!");
  process.exit(0);
});