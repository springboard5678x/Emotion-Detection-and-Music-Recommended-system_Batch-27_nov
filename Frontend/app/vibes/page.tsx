'use client';

import { useState } from 'react';
import { moods, MoodOption } from '@/lib/moods';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronUp, Music2 } from 'lucide-react';

export default function VibesPage() {
    const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
    const [activeService, setActiveService] = useState<string | null>(null);

    // Reset service when mood changes or is closed
    const handleCloseMood = () => {
        setSelectedMood(null);
        setActiveService(null);
    };

    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {!selectedMood ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="flex flex-col gap-2">
                                <motion.h1 layoutId="page-title" className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                                    Mood <span className="text-[#7c3aed]">Presets</span>
                                </motion.h1>
                                <motion.p layoutId="page-desc" className="font-bold text-black/60 text-base max-w-2xl">
                                    Curated playlists for every vibe. Select a mood to listen.
                                </motion.p>
                            </div>

                            {/* Mood Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {moods.map((mood, idx) => (
                                    <motion.div
                                        layoutId={`card-${mood.id}`}
                                        key={mood.id}
                                        onClick={() => setSelectedMood(mood)}
                                        className="bg-white p-4 rounded-[32px] shadow-sm border border-black/5 hover:shadow-xl hover:-translate-y-1 transition-shadow duration-300 group cursor-pointer relative z-10"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-black/10">
                                            {/* Background Image */}
                                            <div className="absolute inset-0">
                                                <img
                                                    src={mood.imageSrc}
                                                    alt={mood.label}
                                                    className="w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-110 filter grayscale-0 lg:grayscale lg:group-hover:grayscale-0"
                                                />
                                                <div className="absolute inset-0 bg-black/20 lg:bg-black/40 lg:group-hover:bg-black/20 transition-colors duration-500" />
                                            </div>

                                            {/* Center Text */}
                                            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
                                                <h3 className="text-4xl md:text-5xl font-black uppercase text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center tracking-tighter leading-[0.85] lg:group-hover:scale-110 transition-transform duration-300">
                                                    {mood.label}
                                                    <br />
                                                    <span className="text-2xl md:text-3xl opacity-80 stroke-text">Vibes</span>
                                                </h3>
                                            </div>

                                            {/* Bottom Branding */}
                                            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-10 pointer-events-none">
                                                <img src="/images/logo.png" alt="MoodMate" className="w-5 h-5 object-contain" />
                                                <span className="text-white font-bold tracking-wide text-sm">MoodMate</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col gap-8"
                        >
                            {/* Top Section: Minimized Tile + Header */}
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                {/* Minimized Tile (Top Left) */}
                                <motion.div
                                    layoutId={`card-${selectedMood.id}`}
                                    className="bg-white p-2 rounded-[24px] shadow-md border border-black/5 w-32 h-32 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={handleCloseMood}
                                >
                                    <div className="relative w-full h-full rounded-xl overflow-hidden border border-black/10">
                                        <img src={selectedMood.imageSrc} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/10" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-black text-xs uppercase tracking-wider drop-shadow-md text-center leading-none">
                                                {selectedMood.label}<br />Vibes
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Header & Desc */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <motion.button
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={handleCloseMood}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold shadow-md hover:bg-zinc-800 mb-2 transition-all uppercase tracking-wider w-fit"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Vibes
                                    </motion.button>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#7c3aed]"
                                    >
                                        {selectedMood.label} Vibes
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="font-bold text-black/60 text-lg max-w-xl"
                                    >
                                        {selectedMood.description} - {selectedMood.useWhen}
                                    </motion.p>
                                </div>
                            </div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                className="h-1 bg-black w-full origin-left rounded-full opacity-10"
                            />

                            {/* Dynamic Layout: Service Selection OR Active Player Grid */}
                            <div className={`grid gap-4 transition-all duration-500 ease-in-out ${activeService ? "grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-auto md:h-[500px]" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>

                                {(() => {
                                    const SERVICES = [
                                        { id: 'Spotify', name: 'Spotify', color: '#1DB954', logo: '/images/spotify.png' },
                                        { id: 'Apple Music', name: 'Apple Music', color: '#FA243C', logo: '/images/apple.png' },
                                        { id: 'Amazon Music', name: 'Amazon Music', color: '#25D1DA', logo: '/images/amazon.png' },
                                        { id: 'YouTube Music', name: 'YouTube Music', color: '#FF0000', logo: '/images/ytmusic.png' },
                                    ];

                                    // Determine render order
                                    let orderedItems = [];
                                    if (activeService) {
                                        const activeItem = SERVICES.find(s => s.name === activeService)!;
                                        const otherItems = SERVICES.filter(s => s.name !== activeService);
                                        orderedItems = [
                                            { ...activeItem, type: 'active' },
                                            ...otherItems.map(s => ({ ...s, type: 'inactive' })),
                                            { type: 'cta', id: 'cta' } // CTA is the 5th item
                                        ];
                                    } else {
                                        orderedItems = SERVICES.map(s => ({ ...s, type: 'standard' }));
                                    }

                                    return orderedItems.map((item: any) => {
                                        if (item.type === 'cta') {
                                            return (
                                                <motion.div
                                                    key="cta"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-[#FACC55] rounded-[32px] border border-black/5 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#E3B645] transition-colors"
                                                    onClick={() => window.location.href = '/home'}
                                                >
                                                    <span className="text-3xl">🏠</span>
                                                    <h3 className="font-black uppercase text-xl leading-tight">Get Your<br />Vibes Home</h3>
                                                    <p className="text-xs font-bold opacity-60">Scan your look & feel</p>
                                                </motion.div>
                                            );
                                        }

                                        const isExpanded = item.type === 'active';

                                        return (
                                            <motion.div
                                                layout
                                                key={item.id}
                                                className={`bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden relative group ${isExpanded ? "md:col-span-2 md:row-span-2 h-[400px] md:h-full" : activeService ? "aspect-auto" : "aspect-[4/3]"}`}
                                                onClick={() => !activeService && setActiveService(item.name)}
                                            >
                                                {isExpanded ? (
                                                    <div className="w-full h-full flex flex-col relative">
                                                        {/* Close Active View Button */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setActiveService(null); }}
                                                            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black hover:bg-zinc-800 w-16 h-6 rounded-b-xl flex items-center justify-center transition-colors shadow-md group/btn"
                                                        >
                                                            <ChevronUp className="w-4 h-4 text-white group-hover/btn:text-white/80 transition-colors" />
                                                        </button>

                                                        {/* Embed Player */}
                                                        <div className="w-full h-full bg-white relative z-10">
                                                            {item.name === 'Spotify' && (
                                                                <iframe
                                                                    src={selectedMood.embedSrc}
                                                                    width="100%"
                                                                    height="100%"
                                                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                                    loading="lazy"
                                                                    style={{ border: 'none' }}
                                                                    className="w-full h-full"
                                                                />
                                                            )}
                                                            {item.name === 'Apple Music' && (
                                                                <iframe
                                                                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                                                                    frameBorder="0"
                                                                    height="450"
                                                                    style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', borderRadius: '10px', height: '100%' }}
                                                                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                                                                    src={selectedMood.appleMusicEmbed || "https://embed.music.apple.com/us/playlist/feeling-happy/pl.0d4aee5424c74d29ad15252eeb43d3b1"} // Fallback or Dynamic
                                                                ></iframe>
                                                            )}
                                                            {item.name === 'Amazon Music' && (
                                                                <iframe
                                                                    id='AmazonMusicEmbedB0GCM2SKC5'
                                                                    src={selectedMood.amazonMusicEmbed ?? 'https://music.amazon.in/embed/B0GCM2SKC5/?id=9c9sMsxOHP&marketplaceId=A3K6Y4MI8GDYMT&musicTerritory=IN'}
                                                                    width='100%'
                                                                    height='100%'
                                                                    style={{ border: 'none', borderRadius: '20px', maxWidth: '100%' }}
                                                                />
                                                            )}
                                                            {item.name === 'YouTube Music' && (
                                                                <iframe
                                                                    width="100%"
                                                                    height="100%"
                                                                    src={`https://www.youtube.com/embed/videoseries?list=${selectedMood.youtubeMusicEmbed ? new URLSearchParams(new URL(selectedMood.youtubeMusicEmbed).search).get('list') : 'RDCLAK5uy_kJWGcrtTC_zrbD6rKkBvOcht_vzijhX1A'}`}
                                                                    title="YouTube Music"
                                                                    frameBorder="0"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    style={{ borderRadius: '20px' }}
                                                                />
                                                            )}
                                                            {/* Placeholder for others */}
                                                            {(item.name !== 'Spotify' && item.name !== 'Apple Music' && item.name !== 'Amazon Music' && item.name !== 'YouTube Music') && (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-black/40">
                                                                    <img src={item.logo} className="w-20 h-20 opacity-20 mb-4" />
                                                                    <p className="font-bold">Player integration coming soon for {item.name}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <ServiceCardContent
                                                        name={item.name}
                                                        color={item.color}
                                                        logo={item.logo}
                                                        compact={!!activeService}
                                                    />
                                                )}
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

function ServiceCardContent({ name, color, logo, compact = false }: { name: string, color: string, logo: string | null, compact?: boolean }) {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 transition-all group ${compact ? 'scale-90' : ''}`}>
            {/* Hover Border */}
            <div
                className="absolute inset-0 rounded-[32px] border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ borderColor: color }}
            />

            {/* Logo Only */}
            <div className="z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-sm">
                {logo ? (
                    <img src={logo} alt={name} className="w-32 h-32 object-contain" />
                ) : (
                    <Music2 className="w-32 h-32" style={{ color }} />
                )}
            </div>
        </div>
    );
}
