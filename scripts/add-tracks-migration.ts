#!/usr/bin/env tsx

import { sql } from "@vercel/postgres";
import { env } from "../env";

async function addTracksColumn() {
  console.log("Adding tracks column to vinyl_vault_records table...");
  
  try {
    // Add tracks column as array of text
    await sql`
      ALTER TABLE vinyl_vault_records 
      ADD COLUMN IF NOT EXISTS tracks TEXT[] DEFAULT '{}'::TEXT[]
    `;
    
    console.log("✅ Successfully added tracks column");
    
  } catch (error) {
    console.error("❌ Failed to add tracks column:", error);
    throw error;
  }
}

async function main() {
  try {
    await addTracksColumn();
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);