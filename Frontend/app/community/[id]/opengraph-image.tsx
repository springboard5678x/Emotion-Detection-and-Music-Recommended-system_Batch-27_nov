import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Vibe Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Initialize Supabase client directly for Edge Runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Vibe Data
    const { data: vibe } = await supabase
        .from('community_playlists')
        .select('*')
        .eq('id', id)
        .single();

    if (!vibe) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: '#FFF8F0',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black',
                        fontWeight: 800,
                    }}
                >
                    MoodMate
                </div>
            ),
            { ...size }
        );
    }

    // Fetch Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', vibe.user_id)
        .single();

    const displayName = profile?.full_name || "Music Lover";
    const avatarSrc = profile?.avatar_url;
    const emotion = vibe.emotion || "Vibe";
    const tagline = vibe.tagline || "";

    // Date Formatter
    const dateStr = new Date(vibe.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#FFF8F0',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40,
                }}
            >
                {/* Card Container */}
                <div
                    style={{
                        background: 'white',
                        width: '1000px',
                        height: '500px',
                        borderRadius: 40,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: 60,
                        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.1)',
                        border: '2px solid rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header: Avatar + User + Date + Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 40 }}>
                        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                            {/* Avatar Ring + Image */}
                            <div
                                style={{
                                    display: 'flex',
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    border: '6px solid #FACC15', // yellow-400
                                    overflow: 'hidden',
                                    backgroundColor: '#f9fafb',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {avatarSrc ? <img src={avatarSrc} width="100%" height="100%" style={{ objectFit: 'cover' }} alt="" /> : <div style={{ fontSize: 32, fontWeight: 900 }}>{displayName.charAt(0)}</div>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: 'black', lineHeight: 1 }}>{displayName}</div>
                                <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.4)', marginTop: 8, fontWeight: 500 }}>{dateStr}</div>
                            </div>
                        </div>

                        {/* Vibe Badge */}
                        <div
                            style={{
                                background: 'rgba(0,0,0,0.05)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                padding: '12px 24px',
                                borderRadius: 999,
                                fontSize: 20,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'rgba(0,0,0,0.6)',
                            }}
                        >
                            {emotion}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                        <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, display: 'flex' }}>
                            <span style={{ marginRight: 12 }}>Feeling</span>
                            <span style={{ color: '#8B5CF6' }}>{emotion}</span>
                            <span style={{ marginLeft: 12 }}>today.</span>
                        </div>
                        {tagline && (
                            <div style={{ fontSize: 32, fontStyle: 'italic', fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>
                                "{tagline}"
                            </div>
                        )}
                    </div>

                    {/* Footer Branding */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: '#FACC15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', color: 'black', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                            MoodMate
                            <span style={{ opacity: 0.5, fontSize: 16, marginLeft: 10, fontWeight: 700 }}>CRAFTED WITH ♥ BY RANIT DERIA</span>
                        </div>
                    </div>

                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
