#!/usr/bin/env bun

import { sql } from "@vercel/postgres";
import { env } from "../env";

async function upgradeArtwork() {
  console.log("🎨 Starting artwork upgrade for existing records...");
  
  try {
    // Get all records that have Discogs image URLs that could be enhanced
    const result = await sql`
      SELECT id, artist, title, image_url, cover_image_url
      FROM vinyl_vault_records 
      WHERE (image_url IS NOT NULL AND image_url LIKE '%discogs.com%')
         OR (cover_image_url IS NOT NULL AND cover_image_url LIKE '%discogs.com%')
    `;
    
    console.log(`Found ${result.rows.length} records with Discogs images to upgrade`);
    
    let updated = 0;
    
    for (const record of result.rows) {
      let needsUpdate = false;
      let newImageUrl = record.image_url;
      let newCoverImageUrl = record.cover_image_url;
      
      // Enhance image_url if it's a Discogs URL
      if (record.image_url && record.image_url.includes('discogs.com') && !record.image_url.includes('_1200')) {
        newImageUrl = record.image_url
          .replace(/(_\d+)\.jpg$/i, '_1200.jpg')
          .replace(/\/R-\d+-/i, '/R-1200-')
          .replace(/\/A-\d+-/i, '/A-1200-')
          .replace(/\/L-\d+-/i, '/L-1200-');
        needsUpdate = true;
      }
      
      // Enhance cover_image_url if it's a Discogs URL  
      if (record.cover_image_url && record.cover_image_url.includes('discogs.com') && !record.cover_image_url.includes('_1200')) {
        newCoverImageUrl = record.cover_image_url
          .replace(/(_\d+)\.jpg$/i, '_1200.jpg')
          .replace(/\/R-\d+-/i, '/R-1200-')
          .replace(/\/A-\d+-/i, '/A-1200-')
          .replace(/\/L-\d+-/i, '/L-1200-');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await sql`
          UPDATE vinyl_vault_records 
          SET image_url = ${newImageUrl}, 
              cover_image_url = ${newCoverImageUrl},
              updated_at = NOW()
          WHERE id = ${record.id}
        `;
        
        updated++;
        console.log(`✅ Updated: ${record.artist} - ${record.title}`);
      }
    }
    
    console.log(`🎉 Artwork upgrade completed! Updated ${updated} records.`);
    
  } catch (error) {
    console.error("❌ Failed to upgrade artwork:", error);
    throw error;
  }
}

async function main() {
  try {
    await upgradeArtwork();
    console.log("🎨 Artwork upgrade completed successfully!");
  } catch (error) {
    console.error("💥 Artwork upgrade failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);