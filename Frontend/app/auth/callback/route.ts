import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const origin = requestUrl.origin;

    if (code) {
        const supabase = await createClient();

        try {
            // Exchange the code for a session
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Error exchanging code for session:', error);
                // Redirect to login with error
                return NextResponse.redirect(`${origin}/login?error=oauth_error`);
            }

            // Success! Redirect to specified page or home
            const next = requestUrl.searchParams.get('next') || '/home';
            return NextResponse.redirect(`${origin}${next}`);
        } catch (err) {
            console.error('Unexpected error during OAuth callback:', err);
            return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
        }
    }

    // No code present, redirect to login
    return NextResponse.redirect(`${origin}/login`);
}
