"use client";

import { motion } from 'framer-motion';
import { Music2, Heart, Share2, Calendar, Play } from 'lucide-react';
import { VibeBadge } from '@/components/community/vibe-badge';
import { SocialShareModal } from '@/components/community/social-share-modal';
import { useState, useEffect } from 'react';

interface VibeDetailedCardProps {
    playlist: any; // Using existing type shape
    currentUserId?: string;
    onLikeToggle: (id: string, isLiked: boolean) => void;
    thumbnail?: string | null;
}

export function VibeDetailedCard({ playlist, currentUserId, onLikeToggle, thumbnail }: VibeDetailedCardProps) {
    const [liked, setLiked] = useState(playlist?.is_liked || false);
    const [likeCount, setLikeCount] = useState(playlist?.likes || 0);
    const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Sync state with props when parent updates
    useEffect(() => {
        if (playlist) {
            setLiked(playlist.is_liked || false);
            setLikeCount(playlist.likes || 0);

            // Fetch Apple Music, JioSaavn, Amazon Music, Gaana, or YouTube thumbnail if present
            const targetLink = (playlist.links || []).find((link: string) =>
                link.includes('music.apple.com') || link.includes('jiosaavn.com') || link.includes('saavn.com') || link.includes('gaana.com') || link.includes('youtube') || link.includes('youtu.be') || link.includes('soundcloud.com') || link.includes('on.soundcloud.com')
            );

            if (targetLink) {
                fetch(`/api/metadata?url=${encodeURIComponent(targetLink)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.image) setFetchedThumbnail(data.image);
                    })
                    .catch(err => console.error("Failed to fetch detailed card metadata", err));
            } else {
                setFetchedThumbnail(null);
            }
        }
    }, [playlist]);

    const activeThumbnail = fetchedThumbnail || thumbnail;

    const profile = playlist?.profile || {};
    const displayName = profile.full_name || "Music Lover";
    const avatarSrc = profile.avatar_url;

    // Helper for initials
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const handleLikeClick = () => {
        if (!currentUserId) return;
        const newLikedState = !liked;
        setLiked(newLikedState);
        setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);
        onLikeToggle(playlist.id, newLikedState);
    };

    const formattedDate = new Date(playlist.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const links = playlist.links || [];

    return (
        <div className="bg-white rounded-[40px] border border-black/5 overflow-hidden shadow-xl group">
            {/* Header / Meta */}
            <div className="p-4 md:p-8 border-b border-black/5 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-black/10 overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ring-4 ring-yellow-400 md:ring-0 md:group-hover:ring-4 md:group-hover:ring-yellow-400">
                        {avatarSrc ? (
                            <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black text-xl text-black/80">{getInitials(displayName)}</span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-black leading-tight">{displayName}</h2>
                        <div className="flex items-center gap-2 text-black/50 font-bold text-xs md:text-sm mt-1">
                            <Calendar className="w-4 h-4" />
                            {formattedDate}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <VibeBadge emotion={playlist.emotion} className="px-4 py-2 text-sm" />
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="p-3 rounded-full bg-black text-white hover:bg-zinc-800 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLikeClick}
                        className={`p-3 rounded-full border border-black/10 transition-all flex items-center gap-2 font-bold ${liked ? 'bg-pink-50 text-[#FB58B4] border-pink-200' : 'bg-white text-black/60 hover:bg-gray-50'}`}
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                        <span>{likeCount}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Info & Links (Spans 2 cols) */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">
                        {/* Vibe Statement */}
                        <div className="space-y-2 md:space-y-4">
                            <h1 className="text-2xl md:text-4xl font-black text-black leading-tight">
                                Feeling <span className="text-[#7c3aed]">{playlist.emotion}</span> today.
                            </h1>
                            {playlist.tagline && (
                                <p className="text-base md:text-xl text-black/60 font-medium italic border-l-4 border-black/10 pl-4 py-1">
                                    "{playlist.tagline}"
                                </p>
                            )}
                        </div>

                        {/* Links Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {links.map((link: string, i: number) => {
                                let hostname = "";
                                try { hostname = new URL(link).hostname.replace('www.', ''); } catch (e) { }

                                let brandColor = "bg-gray-100 text-black";
                                let platformName = "Platform";
                                let icon = <Music2 className="w-8 h-8 opacity-50" />;

                                if (hostname.includes('spotify')) {
                                    brandColor = "bg-[#1DB954]/10 text-[#1DB954]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=G9XXzb9XaEKX&format=png&color=000000" className="w-8 h-8 object-contain" alt="Spotify" />;
                                    platformName = "Spotify";
                                } else if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
                                    brandColor = "bg-[#FF0000]/10 text-[#FF0000]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=V1cbDThDpbRc&format=png&color=000000" className="w-8 h-8 object-contain" alt="YouTube Music" />;
                                    platformName = "YouTube Music";
                                } else if (hostname.includes('apple')) {
                                    brandColor = "bg-[#FA243C]/10 text-[#FA243C]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=81TSi6Gqk0tm&format=png&color=000000" className="w-8 h-8 object-contain" alt="Apple Music" />;
                                    platformName = "Apple Music";
                                } else if (hostname.includes('amazon')) {
                                    brandColor = "bg-[#25D1DA]/10 text-[#25D1DA]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=lxwUaALAeQmr&format=png&color=000000" className="w-8 h-8 object-contain" alt="Amazon Music" />;
                                    platformName = "Amazon Music";
                                } else if (hostname.includes('gaana')) {
                                    brandColor = "bg-[#E72C30]/10 text-[#E72C30]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=CB8RecJzLKk2&format=png&color=000000" className="w-8 h-8 object-contain" alt="Gaana" />;
                                    platformName = "Gaana";
                                } else if (hostname.includes('jiosaavn') || hostname.includes('saavn')) {
                                    brandColor = "bg-[#2BC5B4]/10 text-[#2BC5B4]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=wVpEITQRmAA5&format=png&color=000000" className="w-8 h-8 object-contain" alt="JioSaavn" />;
                                    platformName = "JioSaavn";
                                } else if (hostname.includes('soundcloud')) {
                                    brandColor = "bg-[#FF5500]/10 text-[#FF5500]";
                                    icon = <img src="https://img.icons8.com/?size=100&id=13669&format=png&color=000000" className="w-8 h-8 object-contain" alt="SoundCloud" />;
                                    platformName = "SoundCloud";
                                } else {
                                    platformName = hostname.split('.')[0];
                                    platformName = platformName.charAt(0).toUpperCase() + platformName.slice(1);
                                }

                                return (
                                    <a
                                        key={i}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-4 p-4 md:p-6 rounded-3xl border border-black/5 hover:shadow-lg transition-all group ${brandColor} bg-opacity-20`}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-black/80 truncate">Listen on {platformName}</p>
                                            <p className="text-xs font-bold opacity-50 uppercase tracking-wider">Click to play</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                            <Play className="w-5 h-5 fill-current ml-0.5" />
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Thumbnail */}
                    {activeThumbnail && (
                        <div className="block lg:col-span-1 order-first lg:order-last">
                            <div className="aspect-square rounded-[32px] overflow-hidden border border-black/5 shadow-sm relative group bg-gray-50">
                                <img
                                    src={activeThumbnail}
                                    alt="Vibe Cover"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Share Modal */}
            <SocialShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                playlist={playlist}
                thumbnail={activeThumbnail}
            />
        </div>
    );
}
