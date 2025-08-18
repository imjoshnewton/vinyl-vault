#!/usr/bin/env bun

import { sql } from "@vercel/postgres";
import { env } from "../env";

async function inspectDiscogsImages() {
  console.log("🔍 Inspecting Discogs image data for existing records...");
  
  try {
    // Get a sample of records with their Discogs data
    const result = await sql`
      SELECT id, artist, title, image_url, cover_image_url, discogs_release_id
      FROM vinyl_vault_records 
      WHERE discogs_release_id IS NOT NULL
      LIMIT 5
    `;
    
    console.log(`\n📊 Found ${result.rows.length} records with Discogs release IDs\n`);
    
    for (const record of result.rows) {
      console.log(`🎵 ${record.artist} - ${record.title}`);
      console.log(`   Release ID: ${record.discogs_release_id}`);
      console.log(`   Current image_url: ${record.image_url}`);
      console.log(`   Current cover_image_url: ${record.cover_image_url}`);
      
      // Try to fetch from Discogs API to see what's actually available
      if (record.discogs_release_id) {
        try {
          const discogsUrl = `https://api.discogs.com/releases/${record.discogs_release_id}`;
          const response = await fetch(discogsUrl, {
            headers: {
              'User-Agent': 'VinylVault/1.0',
              'Authorization': `Discogs key=${env.DISCOGS_CLIENT_ID}, secret=${env.DISCOGS_CLIENT_SECRET}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`   📸 Available images from Discogs API:`);
            
            if (data.images && data.images.length > 0) {
              data.images.forEach((img: any, index: number) => {
                console.log(`     ${index + 1}. Type: ${img.type} - ${img.uri}`);
                console.log(`        Width: ${img.width || 'unknown'}px, Height: ${img.height || 'unknown'}px`);
              });
            } else {
              console.log(`     No images array found`);
            }
            
            if (data.thumb) {
              console.log(`   🖼️ Thumb: ${data.thumb}`);
            }
          } else {
            console.log(`   ❌ Failed to fetch from Discogs API: ${response.status}`);
          }
        } catch (apiError) {
          console.log(`   ❌ API Error: ${apiError}`);
        }
      }
      
      console.log(''); // Empty line for readability
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error("❌ Failed to inspect images:", error);
    throw error;
  }
}

async function main() {
  try {
    await inspectDiscogsImages();
    console.log("🔍 Image inspection completed!");
  } catch (error) {
    console.error("💥 Inspection failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);