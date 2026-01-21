import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            console.error(`Fetch failed for ${targetUrl}: ${response.status}`);
            return NextResponse.json({ error: `Failed to fetch page: ${response.status}` }, { status: response.status });
        }

        const html = await response.text();

        // Regex to find og:image - improved for multiline and attribute order
        const ogImageRegex = /<meta\s+(?:[^>]*?\s+)?property=["']og:image["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["']|<meta\s+(?:[^>]*?\s+)?content=["']([^"']+)["']\s+(?:[^>]*?\s+)?property=["']og:image["']/i;
        const match = html.match(ogImageRegex);

        if (match) {
            const image = match[1] || match[2];
            // Decode HTML entities if present? usually raw URL.
            return NextResponse.json({ image });
        }

        // Fallback: look for swift-page-image/twitter:image/etc?
        const twitterImageRegex = /<meta\s+(?:[^>]*?\s+)?name=["']twitter:image["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["']/i;
        const twitterMatch = html.match(twitterImageRegex);
        if (twitterMatch) return NextResponse.json({ image: twitterMatch[1] });

        return NextResponse.json({ error: 'No OpenGraph image found' }, { status: 404 });
    } catch (error) {
        console.error('Metadata fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
