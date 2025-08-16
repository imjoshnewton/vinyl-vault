import { NextRequest, NextResponse } from "next/server";
import { completeDiscogsAuthAction } from "@/actions/discogs.actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get("oauth_token");
    const oauthVerifier = searchParams.get("oauth_verifier");

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(
        new URL("/collection?discogs_error=missing_params", request.url)
      );
    }

    // Get the request token secret from session/cookie
    // For now, we'll pass it through the state parameter or store it temporarily
    // In a production app, you'd want to store this securely in a session
    const requestTokenSecret = searchParams.get("oauth_token_secret");

    if (!requestTokenSecret) {
      return NextResponse.redirect(
        new URL("/collection?discogs_error=missing_secret", request.url)
      );
    }

    const result = await completeDiscogsAuthAction(
      oauthToken,
      requestTokenSecret,
      oauthVerifier
    );

    if (result.success) {
      return NextResponse.redirect(
        new URL("/collection?discogs_success=true", request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/collection?discogs_error=${encodeURIComponent(result.error || "unknown")}`, request.url)
      );
    }
  } catch (error) {
    console.error("Discogs callback error:", error);
    return NextResponse.redirect(
      new URL("/collection?discogs_error=callback_failed", request.url)
    );
  }
}