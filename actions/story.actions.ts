"use server";

import { VinylRecord } from "@/server/db";

interface GenerateStoryImageParams {
  record: VinylRecord;
  ownerName?: string;
  username?: string;
}

export async function generateStoryImageAction(params: GenerateStoryImageParams) {
  try {
    const { record, ownerName = "Vinyl Collection", username } = params;
    
    // Create SVG content that mimics the kiosk mode layout but vertical for stories (1080x1920)
    const svgContent = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1c1917;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#292524;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1c1917;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="15" stdDeviation="25" flood-opacity="0.4"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1080" height="1920" fill="url(#bgGradient)"/>
        
        <!-- Subtle background pattern -->
        <circle cx="200" cy="300" r="150" fill="rgba(255,255,255,0.03)" />
        <circle cx="880" cy="500" r="100" fill="rgba(255,255,255,0.02)" />
        <circle cx="150" cy="1600" r="200" fill="rgba(255,255,255,0.03)" />
        <circle cx="930" cy="1400" r="120" fill="rgba(255,255,255,0.02)" />
        
        <!-- Now Spinning Header with glow effect -->
        <text x="540" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" 
              fill="#10b981" text-anchor="middle" filter="url(#glow)">
          NOW SPINNING
        </text>
        
        <!-- Pulse/vinyl record icon -->
        <circle cx="540" cy="220" r="12" fill="#10b981" opacity="0.8">
          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        <!-- Album Art Container with enhanced shadow -->
        <rect x="90" y="280" width="900" height="900" rx="32" fill="#000" opacity="0.2"/>
        ${record.coverImageUrl || record.imageUrl ? `
          <image href="${record.coverImageUrl || record.imageUrl}" x="90" y="280" width="900" height="900" 
                 preserveAspectRatio="xMidYMid slice" clip-path="inset(0% round 32px)" filter="url(#shadow)"/>
        ` : `
          <rect x="90" y="280" width="900" height="900" rx="32" fill="#292524" filter="url(#shadow)"/>
          <text x="540" y="730" font-family="system-ui" font-size="64" fill="#57534e" text-anchor="middle">♪</text>
          <text x="540" y="800" font-family="system-ui" font-size="36" fill="#57534e" text-anchor="middle">No Cover Art</text>
        `}
        
        <!-- Vinyl record reflection effect -->
        <ellipse cx="540" cy="730" rx="450" ry="450" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" opacity="0.6"/>
        <ellipse cx="540" cy="730" rx="50" ry="50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1" opacity="0.8"/>
        
        <!-- Title with better text wrapping -->
        <text x="540" y="1280" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="800" fill="white" text-anchor="middle">
          ${escapeXml(truncateText(record.title, 22))}
        </text>
        
        <!-- Artist -->
        <text x="540" y="1360" font-family="system-ui, -apple-system, sans-serif" font-size="48" fill="#d6d3d1" text-anchor="middle">
          ${escapeXml(truncateText(record.artist, 25))}
        </text>
        
        <!-- Enhanced Metadata Pills -->
        <g transform="translate(540, 1460)">
          ${record.releaseYear ? `
            <rect x="-200" y="-30" width="130" height="60" rx="30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <text x="-135" y="10" font-family="system-ui" font-size="32" font-weight="600" fill="white" text-anchor="middle">${record.releaseYear}</text>
          ` : ''}
          
          ${record.genre ? `
            <rect x="-50" y="-30" width="180" height="60" rx="30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <text x="40" y="10" font-family="system-ui" font-size="32" font-weight="600" fill="white" text-anchor="middle">${escapeXml(truncateText(record.genre, 10))}</text>
          ` : ''}
          
          ${record.type ? `
            <rect x="160" y="-30" width="110" height="60" rx="30" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <text x="215" y="10" font-family="system-ui" font-size="32" font-weight="600" fill="white" text-anchor="middle">${record.type}</text>
          ` : ''}
        </g>
        
        <!-- Collection Name with enhanced styling -->
        <text x="540" y="1700" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="600" fill="#a8a29e" text-anchor="middle">
          ${escapeXml(ownerName)}'s Collection
        </text>
        
        <!-- Optional username/URL -->
        ${username ? `
          <text x="540" y="1780" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#78716c" text-anchor="middle">
            @${username}
          </text>
        ` : ''}
        
        <!-- Subtle branding -->
        <text x="540" y="1870" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#57534e" text-anchor="middle">
          Vinyl Collection
        </text>
      </svg>
    `;
    
    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    return {
      success: true,
      imageUrl: svgDataUrl
    };
  } catch (error) {
    console.error("Error generating story image:", error);
    return {
      success: false,
      error: "Failed to generate story image"
    };
  }
}

// Helper functions
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}