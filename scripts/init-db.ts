import { sql } from "@vercel/postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

async function initDatabase() {
  try {
    console.log("Creating database tables...");
    
    // Create enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE record_type AS ENUM ('LP', 'Single', 'EP');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
        CREATE TYPE record_condition AS ENUM (
          'Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 
          'Good Plus', 'Good', 'Fair', 'Poor'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        clerk_id VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        username VARCHAR(50) UNIQUE,
        image_url TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create vinyl records table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_records (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        artist VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        label VARCHAR(255),
        catalog_number VARCHAR(100),
        release_year INTEGER,
        genre VARCHAR(100),
        type record_type NOT NULL DEFAULT 'LP',
        condition record_condition DEFAULT 'Very Good',
        notes TEXT,
        image_url TEXT,
        purchase_price INTEGER,
        purchase_date TIMESTAMP,
        is_wishlist BOOLEAN DEFAULT false,
        rating INTEGER,
        play_count INTEGER DEFAULT 0,
        last_played_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create play history table
    await sql`
      CREATE TABLE IF NOT EXISTS vinyl_vault_play_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        record_id UUID NOT NULL REFERENCES vinyl_vault_records(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES vinyl_vault_users(id) ON DELETE CASCADE,
        played_at TIMESTAMP DEFAULT NOW() NOT NULL,
        notes TEXT
      );
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS username_idx ON vinyl_vault_users(username);`;
    await sql`CREATE INDEX IF NOT EXISTS user_id_idx ON vinyl_vault_records(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS artist_idx ON vinyl_vault_records(artist);`;
    await sql`CREATE INDEX IF NOT EXISTS type_idx ON vinyl_vault_records(type);`;
    await sql`CREATE INDEX IF NOT EXISTS wishlist_idx ON vinyl_vault_records(is_wishlist);`;
    await sql`CREATE INDEX IF NOT EXISTS record_id_idx ON vinyl_vault_play_history(record_id);`;
    await sql`CREATE INDEX IF NOT EXISTS play_history_user_id_idx ON vinyl_vault_play_history(user_id);`;
    
    console.log("✅ Database tables created successfully!");
  } catch (error) {
    console.error("Error creating database tables:", error);
    process.exit(1);
  }
}

initDatabase();