/**
 * Service for fetching high-resolution album artwork from multiple sources
 */

interface ArtworkResult {
  url: string;
  width?: number;
  height?: number;
  source: string;
}

class ArtworkService {
  /**
   * Try to get higher resolution version of a Discogs image URL
   */
  private enhanceDiscogsUrl(url: string): string {
    if (!url || !url.includes('discogs.com')) {
      return url;
    }

    // Try different size parameters for higher resolution
    const enhanced = url
      .replace(/(_\d+)\.jpg$/i, '_600.jpg') // Try 600px version
      .replace(/\/R-\d+-/i, '/R-600-') // Alternative format
      .replace(/\/A-\d+-/i, '/A-600-') // Artist images
      .replace(/\/L-\d+-/i, '/L-600-'); // Label images
    
    return enhanced;
  }

  /**
   * Search Last.fm for album artwork
   */
  private async searchLastFm(artist: string, album: string): Promise<ArtworkResult | null> {
    try {
      // Last.fm requires an API key - you'd need to sign up for one
      // This is a placeholder for now
      const apiKey = process.env.LASTFM_API_KEY;
      if (!apiKey) return null;

      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const images = data.album?.image;
      
      if (images && Array.isArray(images)) {
        // Last.fm provides different sizes: small, medium, large, extralarge, mega
        const megaImage = images.find(img => img.size === 'mega');
        const extraLargeImage = images.find(img => img.size === 'extralarge');
        const largeImage = images.find(img => img.size === 'large');
        
        const bestImage = megaImage || extraLargeImage || largeImage;
        if (bestImage && bestImage['#text']) {
          return {
            url: bestImage['#text'],
            source: 'Last.fm'
          };
        }
      }
    } catch (error) {
      console.warn('Last.fm artwork search failed:', error);
    }
    
    return null;
  }

  /**
   * Search MusicBrainz Cover Art Archive
   */
  private async searchMusicBrainz(artist: string, album: string): Promise<ArtworkResult | null> {
    try {
      // First, search for the release in MusicBrainz
      const searchUrl = `https://musicbrainz.org/ws/2/release/?query=artist:"${encodeURIComponent(artist)}" AND release:"${encodeURIComponent(album)}"&fmt=json&limit=1`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'VinylVault/1.0 (contact@example.com)' // MusicBrainz requires a User-Agent
        }
      });
      
      if (!searchResponse.ok) return null;
      
      const searchData = await searchResponse.json();
      const releases = searchData.releases;
      
      if (!releases || releases.length === 0) return null;
      
      const releaseId = releases[0].id;
      
      // Now get the cover art from Cover Art Archive
      const coverArtUrl = `https://coverartarchive.org/release/${releaseId}`;
      
      const coverResponse = await fetch(coverArtUrl);
      if (!coverResponse.ok) return null;
      
      const coverData = await coverResponse.json();
      const images = coverData.images;
      
      if (images && images.length > 0) {
        // Find the front cover or first available image
        const frontCover = images.find((img: any) => img.front === true) || images[0];
        
        if (frontCover) {
          return {
            url: frontCover.image, // Full resolution image
            width: frontCover.thumbnails?.large ? undefined : 1200, // Cover Art Archive can be very high res
            height: frontCover.thumbnails?.large ? undefined : 1200,
            source: 'MusicBrainz Cover Art Archive'
          };
        }
      }
    } catch (error) {
      console.warn('MusicBrainz artwork search failed:', error);
    }
    
    return null;
  }

  /**
   * Get the best available artwork for an album
   */
  async getBestArtwork(
    artist: string, 
    album: string, 
    currentDiscogsUrl?: string
  ): Promise<ArtworkResult[]> {
    const results: ArtworkResult[] = [];
    
    // Start with enhanced Discogs URL if available
    if (currentDiscogsUrl) {
      const enhancedUrl = this.enhanceDiscogsUrl(currentDiscogsUrl);
      results.push({
        url: enhancedUrl,
        source: 'Discogs (Enhanced)'
      });
    }
    
    // Try MusicBrainz (free and often has high-res images)
    const mbResult = await this.searchMusicBrainz(artist, album);
    if (mbResult) {
      results.push(mbResult);
    }
    
    // Try Last.fm (requires API key)
    const lastFmResult = await this.searchLastFm(artist, album);
    if (lastFmResult) {
      results.push(lastFmResult);
    }
    
    return results;
  }

  /**
   * Test if an image URL is accessible and get its dimensions
   */
  async validateImageUrl(url: string): Promise<{ valid: boolean; width?: number; height?: number }> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return { valid: false };
      }
      
      // For now, just validate it exists
      // Could extend to get actual dimensions if needed
      return { valid: true };
    } catch {
      return { valid: false };
    }
  }
}

export const artworkService = new ArtworkService();