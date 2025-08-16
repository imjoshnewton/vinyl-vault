import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { discogsService } from '@/services/discogs.service';
import { oauthStorage } from '@/lib/oauth-storage';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { users } from '@/server/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(
        new URL('/collection?error=oauth-params-missing', request.url)
      );
    }

    // Get the stored token secret
    const tokenSecret = oauthStorage.get(oauthToken);
    if (!tokenSecret) {
      return NextResponse.redirect(
        new URL('/collection?error=oauth-token-expired', request.url)
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

    // Update user in database
    await db
      .update(users)
      .set({
        discogsUsername: discogsUser.username,
        discogsAccessToken: accessToken,
        discogsTokenSecret: accessTokenSecret,
        discogsSyncEnabled: true,
      })
      .where(eq(users.id, userId));

    // Clean up temporary storage
    oauthStorage.remove(oauthToken);

    // Redirect back to collection with success
    return NextResponse.redirect(
      new URL('/collection?discogs=connected', request.url)
    );
  } catch (error) {
    console.error('Discogs OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/collection?error=oauth-failed', request.url)
    );
  }
}