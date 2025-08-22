import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }
    
    // Validate the URL is from allowed domains
    const allowedDomains = [
      'i.discogs.com',
      'img.discogs.com',
      's3.amazonaws.com',
      'images.unsplash.com',
      // Add other trusted image domains as needed
    ];
    
    try {
      const url = new URL(imageUrl);
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith('.' + domain)
      );
      
      if (!isAllowed) {
        return new NextResponse('Domain not allowed', { status: 403 });
      }
    } catch {
      return new NextResponse('Invalid URL', { status: 400 });
    }
    
    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Vinyl Collection App/1.0',
      },
    });
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return new NextResponse('Not an image', { status: 400 });
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}