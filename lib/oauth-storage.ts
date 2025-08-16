// Simple in-memory storage for OAuth tokens
// In production, you'd want to use Redis or a database
const tokenStorage = new Map<string, { tokenSecret: string; timestamp: number }>();

// Clean up old tokens (older than 10 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenStorage.entries()) {
    if (now - value.timestamp > TOKEN_EXPIRY) {
      tokenStorage.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export const oauthStorage = {
  store(token: string, tokenSecret: string): void {
    tokenStorage.set(token, {
      tokenSecret,
      timestamp: Date.now(),
    });
  },

  get(token: string): string | null {
    const stored = tokenStorage.get(token);
    if (!stored) return null;
    
    // Check if expired
    if (Date.now() - stored.timestamp > TOKEN_EXPIRY) {
      tokenStorage.delete(token);
      return null;
    }
    
    return stored.tokenSecret;
  },

  remove(token: string): void {
    tokenStorage.delete(token);
  },
};