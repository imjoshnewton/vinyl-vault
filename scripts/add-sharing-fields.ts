import { sql } from "@vercel/postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

async function addSharingFields() {
  try {
    console.log("Adding username and sharing fields to users table...");
    
    // Add username column
    await sql`
      ALTER TABLE vinyl_vault_users 
      ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE
    `;
    
    // Add is_public column
    await sql`
      ALTER TABLE vinyl_vault_users 
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false
    `;
    
    // Create username index
    await sql`
      CREATE INDEX IF NOT EXISTS username_idx ON vinyl_vault_users(username)
    `;
    
    console.log("✅ Successfully added sharing fields!");
  } catch (error) {
    console.error("Error adding sharing fields:", error);
    process.exit(1);
  }
}

addSharingFields();