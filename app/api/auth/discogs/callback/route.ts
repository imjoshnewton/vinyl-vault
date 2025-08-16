import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { discogsService } from '@/services/discogs.service';
import { oauthStorage } from '@/lib/oauth-storage';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { users } from '@/server/db/schema';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      const baseUrl = env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
      return NextResponse.redirect(new URL('/sign-in', baseUrl));
    }

    const searchParams = request.nextUrl.searchParams;
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');

    const baseUrl = env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(
        new URL('/collection?error=oauth-params-missing', baseUrl)
      );
    }

    // Get the stored token secret
    const tokenSecret = oauthStorage.get(oauthToken);
    if (!tokenSecret) {
      return NextResponse.redirect(
        new URL('/collection?error=oauth-token-expired', baseUrl)
      );
    }

    // Exchange for access token
    const { accessToken, accessTokenSecret } = await discogsService.getAccessToken(
      oauthToken,
      tokenSecret,
      oauthVerifier
    );

    // Get user info from Discogs
    const discogsUser = await discogsService.getUser(accessToken, accessTokenSecret);

    // Update user in database - use clerkId not id
    await db
      .update(users)
      .set({
        discogsUsername: discogsUser.username,
        discogsAccessToken: accessToken,
        discogsTokenSecret: accessTokenSecret,
        discogsSyncEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, userId));

    // Clean up temporary storage
    oauthStorage.remove(oauthToken);

    // Redirect back to collection with success
    return NextResponse.redirect(
      new URL('/collection?discogs=connected', baseUrl)
    );
  } catch (error) {
    console.error('Discogs OAuth callback error:', error);
    const baseUrl = env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`;
    return NextResponse.redirect(
      new URL('/collection?error=oauth-failed', baseUrl)
    );
  }
}