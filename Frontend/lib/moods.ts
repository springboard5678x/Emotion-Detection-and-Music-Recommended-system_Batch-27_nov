import { Smile, CloudRain, Wind, Zap, Target, Moon } from 'lucide-react';

export type MoodOption = {
    id: string;
    label: string;
    description: string;
    useWhen: string;
    color: string;
    textColor: string;
    icon: any;
    prompt: string;
    embedSrc: string; // Default/Spotify
    imageSrc: string;
    appleMusicEmbed?: string;
    amazonMusicEmbed?: string;
    youtubeMusicEmbed?: string;
};

export const moods: MoodOption[] = [
    {
        id: 'happy',
        label: 'Happy',
        description: 'Upbeat tracks to elevate your mood.',
        useWhen: 'Celebrating, feeling good.',
        color: '#FACC55',
        textColor: '#000000',
        icon: Smile,
        prompt: 'I am feeling happy and upbeat.',
        embedSrc: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWTwbZHrJRIgD?utm_source=generator',
        imageSrc: '/images/Happy.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/feeling-happy/pl.0d4aee5424c74d29ad15252eeb43d3b1',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0GCM2SKC5/?id=9c9sMsxOHP&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_kJWGcrtTC_zrbD6rKkBvOcht_vzijhX1A&playnext=1&si=7UAC9GygqHTPBcGa',
    },
    {
        id: 'sad',
        label: 'Sad',
        description: 'Soft, emotional tracks for reflection.',
        useWhen: 'Processing feelings, winding down.',
        color: '#94A3B8',
        textColor: '#FFFFFF',
        icon: CloudRain,
        prompt: 'I am feeling sad and reflective.',
        embedSrc: 'https://open.spotify.com/embed/playlist/0ex8S6Yv66hnROKKBjxG0O?utm_source=generator',
        imageSrc: '/images/Sad.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/grief/pl.10f526b8bd794ef1a157304a06c9713b',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0G4QWWS7S/?id=XBBVQpPQQs&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_mSYG34VyO-hwKte2AnP1O4766M4y7AJ4w&playnext=1&si=77y26HsO1F8qd8We',
    },
    {
        id: 'chill',
        label: 'Chill',
        description: 'Relaxed, mellow sounds for calm.',
        useWhen: 'Resting, casual listening.',
        color: '#3DD598',
        textColor: '#000000',
        icon: Wind,
        prompt: 'I am feeling chill and relaxed.',
        embedSrc: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX889U0CL85jj?utm_source=generator',
        imageSrc: '/images/Chill.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/todays-chill/pl.2bb29727dbc34a63936787297305c37c',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0GCG53JKN/?id=ZEyfGbg8n1&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_m5-Ur8LO4mxLbawH6xdL4htYBw9mq-1RI&playnext=1&si=wMG1mUK2Wz1iA2Pr',
    },
    {
        id: 'energetic',
        label: 'Energetic',
        description: 'High-energy tracks to keep you moving.',
        useWhen: 'Working out, needing a push.',
        color: '#FB58B4',
        textColor: '#000000',
        icon: Zap,
        prompt: 'I am feeling super energetic.',
        embedSrc: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator',
        imageSrc: '/images/Energetic.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/pop-workout/pl.daa788c0ab3841febf12046d5bd67546',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0G2XBNPRQ/?id=xwMbjgBKc9&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_lX24L_CGP46xH6pM4FgXpX4yNr3jX9xpU&playnext=1&si=Lm8-3rGvQTkEAKqh',
    },
    {
        id: 'focus',
        label: 'Focus',
        description: 'Minimal music for concentration.',
        useWhen: 'Studying, coding.',
        color: '#ffffff',
        textColor: '#000000',
        icon: Target,
        prompt: 'I need to focus and concentrate.',
        embedSrc: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx5yEZkcJ?utm_source=generator',
        imageSrc: '/images/Focus1.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/deep-focus/pl.556863bb540c4651b6196bf82e2a3bb9',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0FBKV5G1N/?id=8GZmxht7Sg&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_kVXmNQjiBEKjCGifBWc3eTMg8Fwjc6K8M&playnext=1&si=F7_7sACVlP2q1f8s',
    },
    {
        id: 'sleep',
        label: 'Sleep',
        description: 'Slow, soothing tracks to help unwind.',
        useWhen: 'Night routines, relaxation.',
        color: '#C4B5FD',
        textColor: '#000000',
        icon: Moon,
        prompt: 'I am trying to sleep and unwind.',
        embedSrc: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZd79rJ6a7lp?utm_source=generator',
        imageSrc: '/images/Sleep.png',
        appleMusicEmbed: 'https://embed.music.apple.com/us/playlist/ambient-sleep/pl.2ce0acb450d048c49d4c4b52b2f4b195',
        amazonMusicEmbed: 'https://music.amazon.in/embed/B0G79NH63W/?id=HvYxfGDEdm&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN',
        youtubeMusicEmbed: 'https://music.youtube.com/playlist?list=RDCLAK5uy_l2OjbOL4oVkkHE86UT6oQCNufuv8d0luQ&playnext=1&si=TwgVLGzhAbPmLNEF',
    },
];
