import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { env } from "@/env";

// Discogs API types
export interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{ name: string; join?: string }>;
  labels: Array<{ name: string; catno?: string }>;
  year?: number;
  genres?: string[];
  styles?: string[];
  formats: Array<{
    name: string;
    qty: string;
    descriptions?: string[];
  }>;
  images?: Array<{ uri: string; type: string }>;
  basic_information?: {
    id: number;
    title: string;
    year?: number;
    master_id?: number;
    artists: Array<{ name: string }>;
    labels: Array<{ name: string; catno?: string }>;
    genres?: string[];
    styles?: string[];
    formats: Array<{ name: string; qty: string }>;
    thumb?: string;
  };
}

export interface DiscogsCollectionItem {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: DiscogsRelease["basic_information"];
}

export interface DiscogsUser {
  id: number;
  username: string;
  name?: string;
  email?: string;
  profile?: string;
  avatar_url?: string;
}

class DiscogsService {
  private oauth: OAuth;
  private baseUrl = "https://api.discogs.com";

  constructor() {
    this.oauth = new OAuth({
      consumer: {
        key: env.DISCOGS_CLIENT_ID,
        secret: env.DISCOGS_CLIENT_SECRET,
      },
      signature_method: "PLAINTEXT",
      hash_function(base_string, key) {
        // For PLAINTEXT, signature is just consumer_secret&token_secret
        return key;
      },
    });
  }

  /**
   * Get OAuth request token to start the authentication flow
   */
  async getRequestToken(): Promise<{ token: string; tokenSecret: string; authUrl: string }> {
    const requestTokenURL = "https://api.discogs.com/oauth/request_token";
    
    const requestData = {
      url: requestTokenURL,
      method: "GET",
    };

    const response = await fetch(requestTokenURL, {
      method: "GET",
      headers: {
        ...this.oauth.toHeader(this.oauth.authorize(requestData)),
        "User-Agent": "VinylVault/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get request token: ${response.statusText}`);
    }

    const responseText = await response.text();
    const params = new URLSearchParams(responseText);
    const token = params.get("oauth_token")!;
    const tokenSecret = params.get("oauth_token_secret")!;
    
    // Don't include callback - use PIN-based flow
    const authUrl = `https://www.discogs.com/oauth/authorize?oauth_token=${token}`;
    
    return { token, tokenSecret, authUrl };
  }

  /**
   * Exchange request token and verifier for access token
   */
  async getAccessToken(
    requestToken: string,
    requestTokenSecret: string,
    verifier: string
  ): Promise<{ accessToken: string; accessTokenSecret: string }> {
    const accessTokenURL = "https://api.discogs.com/oauth/access_token";
    
    // Create request data with oauth_verifier included for signature
    const requestData = {
      url: accessTokenURL,
      method: "POST",
      data: {
        oauth_verifier: verifier
      }
    };

    const token = {
      key: requestToken,
      secret: requestTokenSecret,
    };

    // Generate the OAuth authorization header
    const oauthData = this.oauth.authorize(requestData, token);
    
    // Add oauth_verifier to the OAuth data
    (oauthData as any).oauth_verifier = verifier;
    
    const authHeader = this.oauth.toHeader(oauthData);

    const response = await fetch(accessTokenURL, {
      method: "POST",
      headers: {
        ...authHeader,
        "User-Agent": "VinylVault/1.0",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `oauth_verifier=${encodeURIComponent(verifier)}`,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Access token error response:', errorText);
      console.error('Request headers:', authHeader);
      console.error('Request body:', `oauth_verifier=${encodeURIComponent(verifier)}`);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Access token response:', responseText);
    
    const params = new URLSearchParams(responseText);
    const accessToken = params.get("oauth_token");
    const accessTokenSecret = params.get("oauth_token_secret");
    
    if (!accessToken || !accessTokenSecret) {
      throw new Error("Invalid response: missing tokens");
    }
    
    return { accessToken, accessTokenSecret };
  }

  /**
   * Make authenticated API request
   */
  private async makeAuthenticatedRequest(
    url: string,
    accessToken: string,
    accessTokenSecret: string,
    method: "GET" | "POST" = "GET"
  ): Promise<any> {
    const requestData = {
      url,
      method,
    };

    const token = {
      key: accessToken,
      secret: accessTokenSecret,
    };

    const response = await fetch(url, {
      method,
      headers: {
        ...this.oauth.toHeader(this.oauth.authorize(requestData, token)),
        "User-Agent": "VinylVault/1.0",
        "Accept": "application/vnd.discogs.v2.discogs+json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile
   */
  async getUser(accessToken: string, accessTokenSecret: string): Promise<DiscogsUser> {
    const url = `${this.baseUrl}/oauth/identity`;
    return this.makeAuthenticatedRequest(url, accessToken, accessTokenSecret);
  }

  /**
   * Get user's collection with pagination
   */
  async getUserCollection(
    username: string,
    accessToken: string,
    accessTokenSecret: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<{
    releases: DiscogsCollectionItem[];
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      items: number;
    };
  }> {
    const url = `${this.baseUrl}/users/${username}/collection/folders/0/releases?page=${page}&per_page=${perPage}`;
    return this.makeAuthenticatedRequest(url, accessToken, accessTokenSecret);
  }

  /**
   * Get detailed release information
   */
  async getRelease(
    releaseId: number,
    accessToken: string,
    accessTokenSecret: string
  ): Promise<DiscogsRelease> {
    const url = `${this.baseUrl}/releases/${releaseId}`;
    return this.makeAuthenticatedRequest(url, accessToken, accessTokenSecret);
  }

  /**
   * Add release to user's collection
   */
  async addToCollection(
    username: string,
    releaseId: number,
    accessToken: string,
    accessTokenSecret: string
  ): Promise<{ instance_id: number }> {
    const url = `${this.baseUrl}/users/${username}/collection/folders/1/releases/${releaseId}`;
    return this.makeAuthenticatedRequest(url, accessToken, accessTokenSecret, "POST");
  }

  /**
   * Search for releases
   */
  async searchReleases(
    query: string,
    accessToken?: string,
    accessTokenSecret?: string
  ): Promise<{
    results: Array<{
      id: number;
      title: string;
      year?: string;
      format?: string[];
      label?: string[];
      genre?: string[];
      thumb?: string;
    }>;
  }> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/database/search?q=${encodedQuery}&type=release`;
    
    if (accessToken && accessTokenSecret) {
      return this.makeAuthenticatedRequest(url, accessToken, accessTokenSecret);
    } else {
      // Public search without authentication - still needs API key
      const response = await fetch(url, {
        headers: {
          "User-Agent": "VinylVault/1.0",
          "Accept": "application/vnd.discogs.v2.discogs+json",
          "Authorization": `Discogs key=${env.DISCOGS_CLIENT_ID}, secret=${env.DISCOGS_CLIENT_SECRET}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }
  }

  /**
   * Check if a Discogs release is vinyl format
   */
  isVinylFormat(discogsItem: DiscogsCollectionItem | DiscogsRelease): boolean {
    const basicInfo = "basic_information" in discogsItem 
      ? discogsItem.basic_information 
      : discogsItem;

    if (!basicInfo || !basicInfo.formats) {
      return false;
    }

    for (const format of basicInfo.formats) {
      const formatName = format.name.toLowerCase();
      const descriptions = ("descriptions" in format && format.descriptions) 
        ? format.descriptions.join(" ").toLowerCase() 
        : "";
      
      // Check if it's a vinyl format
      if (formatName.includes("vinyl") || 
          descriptions.includes("12\"") || 
          descriptions.includes("7\"") || 
          descriptions.includes("10\"") ||
          descriptions.includes("lp") ||
          descriptions.includes("single") ||
          descriptions.includes("ep")) {
        return true;
      }
      
      // Skip CDs, Cassettes, Digital, etc.
      if (formatName.includes("cd") ||
          formatName.includes("cassette") ||
          formatName.includes("digital") ||
          formatName.includes("file") ||
          formatName.includes("mp3")) {
        return false;
      }
    }

    // Default to false if format is unclear
    return false;
  }

  /**
   * Map Discogs release to our vinyl record format
   */
  mapDiscogsToVinylRecord(
    discogsItem: DiscogsCollectionItem | DiscogsRelease,
    userId: string
  ) {
    const basicInfo = "basic_information" in discogsItem 
      ? discogsItem.basic_information 
      : discogsItem;

    if (!basicInfo) {
      throw new Error("No basic information available for this release");
    }

    // Check if this is actually a vinyl record
    if (!this.isVinylFormat(discogsItem)) {
      throw new Error("This release is not a vinyl record");
    }

    // Extract artist names
    const artists = basicInfo.artists?.map(a => a.name).join(", ") || "Unknown Artist";
    
    // Extract label and catalog number
    const label = basicInfo.labels?.[0]?.name || null;
    const catalogNumber = basicInfo.labels?.[0]?.catno || null;
    
    // Determine record type from format
    let recordType: "LP" | "Single" | "EP" = "LP";
    const format = basicInfo.formats?.[0];
    if (format) {
      const formatName = format.name.toLowerCase();
      const descriptions = ("descriptions" in format && format.descriptions) 
        ? format.descriptions.join(" ").toLowerCase() 
        : "";
      
      if (formatName.includes("single") || descriptions.includes("7\"")) {
        recordType = "Single";
      } else if (formatName.includes("ep") || descriptions.includes("ep")) {
        recordType = "EP";
      }
    }

    // Extract genres
    const genres = [
      ...(basicInfo.genres || []),
      ...(basicInfo.styles || [])
    ].join(", ") || null;

    return {
      userId,
      artist: artists,
      title: basicInfo.title,
      label,
      catalogNumber,
      releaseYear: basicInfo.year || null,
      genre: genres,
      type: recordType,
      condition: "Very Good" as const, // Default condition
      imageUrl: ("thumb" in basicInfo ? basicInfo.thumb : null) || null,
      discogsReleaseId: basicInfo.id?.toString() || ("id" in discogsItem ? discogsItem.id.toString() : null),
      discogsMasterId: ("master_id" in basicInfo ? basicInfo.master_id?.toString() : null) || null,
      discogsInstanceId: "instance_id" in discogsItem ? discogsItem.instance_id.toString() : null,
      lastDiscogsSyncAt: new Date(),
    };
  }

  /**
   * Validate record type mapping
   */
  private determineRecordType(formats: Array<{ name: string; descriptions?: string[] }>): "LP" | "Single" | "EP" {
    if (!formats || formats.length === 0) return "LP";
    
    const format = formats[0];
    const formatName = format.name.toLowerCase();
    const descriptions = format.descriptions?.join(" ").toLowerCase() || "";
    
    // Check for singles (7" or explicitly marked as single)
    if (formatName.includes("single") || descriptions.includes("7\"") || descriptions.includes("45 rpm")) {
      return "Single";
    }
    
    // Check for EPs
    if (formatName.includes("ep") || descriptions.includes("ep") || descriptions.includes("extended play")) {
      return "EP";
    }
    
    // Default to LP for albums, LPs, 12" records
    return "LP";
  }
}

export const discogsService = new DiscogsService();