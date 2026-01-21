import { Metadata } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import VibeDetailsClient from './vibe-details-client';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;

    // Server-side fetch using direct supabase-js client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    const { data: vibe } = await supabase
        .from('community_playlists')
        .select('emotion, tagline')
        .eq('id', id)
        .single();

    if (!vibe) {
        return {
            title: 'Vibe Not Found | MoodMate',
        };
    }

    return {
        title: `Feeling ${vibe.emotion} | MoodMate`,
        description: vibe.tagline || `Check out this ${vibe.emotion} playlist on MoodMate`,
        openGraph: {
            title: `Feeling ${vibe.emotion} on MoodMate`,
            description: vibe.tagline || `Check out this ${vibe.emotion} playlist`,
            images: [`/community/${id}/opengraph-image`],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Feeling ${vibe.emotion} on MoodMate`,
            description: vibe.tagline || `Check out this ${vibe.emotion} playlist`,
            images: [`/community/${id}/opengraph-image`],
        }
    };
}

export default async function VibeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    await params; // Params must be awaited in async server components in Next 15+ (though likely auto-unwrapped in 14 it's good practice)
    return <VibeDetailsClient />;
}
