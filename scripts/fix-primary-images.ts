#!/usr/bin/env bun

import { sql } from "@vercel/postgres";
import { env } from "../env";

async function fixPrimaryImages() {
  console.log("🔧 Fixing primary images by using Discogs API data...");
  
  try {
    // Get all records with Discogs release IDs
    const result = await sql`
      SELECT id, artist, title, image_url, cover_image_url, discogs_release_id
      FROM vinyl_vault_records 
      WHERE discogs_release_id IS NOT NULL
      AND (cover_image_url IS NULL OR image_url LIKE '%h:150%')
    `;
    
    console.log(`Found ${result.rows.length} records to fix\n`);
    
    let updated = 0;
    
    for (const record of result.rows) {
      console.log(`🎵 Processing: ${record.artist} - ${record.title}`);
      
      try {
        // Fetch from Discogs API
        const discogsUrl = `https://api.discogs.com/releases/${record.discogs_release_id}`;
        const response = await fetch(discogsUrl, {
          headers: {
            'User-Agent': 'VinylVault/1.0',
            'Authorization': `Discogs key=${env.DISCOGS_CLIENT_ID}, secret=${env.DISCOGS_CLIENT_SECRET}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Get the primary image
          const primaryImage = data.images?.find((img: any) => img.type === 'primary');
          const bestImage = primaryImage?.uri || data.thumb;
          
          if (bestImage) {
            // Update both image_url (for compatibility) and cover_image_url (for high-res)
            await sql`
              UPDATE vinyl_vault_records 
              SET image_url = ${data.thumb || bestImage},
                  cover_image_url = ${bestImage},
                  updated_at = NOW()
              WHERE id = ${record.id}
            `;
            
            updated++;
            console.log(`   ✅ Updated with primary image: ${bestImage.substring(0, 80)}...`);
          } else {
            console.log(`   ⚠️  No images found`);
          }
        } else {
          console.log(`   ❌ API Error: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error}`);
      }
      
      // Delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 Fixed ${updated} records with primary images!`);
    
  } catch (error) {
    console.error("❌ Failed to fix images:", error);
    throw error;
  }
}

async function main() {
  try {
    await fixPrimaryImages();
    console.log("🔧 Image fix completed successfully!");
  } catch (error) {
    console.error("💥 Fix failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);