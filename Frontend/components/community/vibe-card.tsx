"use client";

import { motion } from 'framer-motion';
import { Share2, Heart, Music2, MoreHorizontal, Play, Lock, Trash2, Edit2, MessageCircle } from 'lucide-react';
import { VibeBadge } from '@/components/community/vibe-badge';
import { SocialShareModal } from '@/components/community/social-share-modal';
import { useState, useEffect } from 'react';

export interface VibeCardProps {
    playlist: any;
    index: number;
    currentUserId?: string;
    onLikeToggle: (id: string, isLiked: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (playlist: any) => void;
    onShowToast: (message: string, type: 'success' | 'error') => void;
    onClick?: (playlist: any) => void;
    onCommentClick?: (playlist: any) => void;
}

export function VibeCard({ playlist, index, currentUserId, onLikeToggle, onDelete, onEdit, onShowToast, onClick, onCommentClick }: VibeCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [liked, setLiked] = useState(playlist.is_liked || false);
    const [likeCount, setLikeCount] = useState(playlist.likes || 0);

    // Sync state with props when parent updates
    useEffect(() => {
        if (playlist) {
            setLiked(playlist.is_liked || false);
            setLikeCount(playlist.likes || 0);
        }
    }, [playlist]);

    // Real Data from Profile Join
    const profile = playlist.profile || {};
    const displayName = profile.full_name || "Music Lover";
    const isOwner = currentUserId && currentUserId === playlist.user_id;

    const handleLikeClick = () => {
        if (!currentUserId) {
            onShowToast("Please login to like!", "error");
            return;
        }

        const newLikedState = !liked;
        const newCount = newLikedState ? likeCount + 1 : likeCount - 1;

        // Optimistic Update
        setLiked(newLikedState);
        setLikeCount(newCount);

        onLikeToggle(playlist.id, newLikedState);
    };

    // Determine Avatar
    const avatarSrc = profile.avatar_url;

    // Helper for initials
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const timeAgo = new Date(playlist.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    // Social Counts (Defaults to 0 if null)
    const comments = playlist.comments || 0;

    const links = playlist.links || [];
    const displayLinks = links.slice(0, 4);

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on interactive elements
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
            return;
        }
        if (onClick) {
            onClick(playlist);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={handleCardClick}
            className="bg-white rounded-[32px] border border-black/5 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 group h-full relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Owner Actions Menu */}
            {isOwner && (
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-full hover:bg-black/5 text-black/30 hover:text-black transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl border border-black/5 shadow-xl py-1 z-30 flex flex-col">
                            <button
                                onClick={() => { setIsMenuOpen(false); onEdit(playlist); }}
                                className="px-4 py-2 text-left text-sm font-bold text-black/70 hover:bg-gray-50 hover:text-black flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button
                                onClick={() => { setIsMenuOpen(false); onDelete(playlist.id); }}
                                className="px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )}

                    {/* Backdrop to close menu */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    )}
                </div>
            )}

            {/* Header: User Info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-black/10 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:ring-4 group-hover:ring-yellow-400">
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-black text-sm text-black/80">
                                {getInitials(displayName)}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col leading-none gap-1">
                        <span className="font-bold text-sm text-black/90 truncate max-w-[120px]">{displayName}</span>
                        <span className="text-xs font-medium text-black/40">{timeAgo}</span>
                    </div>
                </div>

                {/* Emotion Badge */}
                {!isOwner && (
                    <div className="flex items-center gap-3">
                        <VibeBadge emotion={playlist.emotion} />
                    </div>
                )}
            </div>

            {/* Content: Vibe Title */}
            <div>
                <p className="font-medium text-black/80 leading-snug">
                    Feeling <span className="font-bold text-black" style={{ color: "#7c3aed" }}>{playlist.emotion}</span> today.
                </p>
                {playlist.tagline && (
                    <p className="text-sm text-black/60 font-medium mt-1 italic">
                        "{playlist.tagline}"
                    </p>
                )}
            </div>

            {/* Media Grid */}
            <div className={`grid gap-2 aspect-square w-full rounded-2xl overflow-hidden border border-black/5 bg-gray-50 ${displayLinks.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {displayLinks.map((link: string, i: number) => {
                    // Random deterministic selection: (cardIndex + linkIndex) % 5 + 1
                    // ensuring no adjacent cards (cardIndex) or adjacent links (linkIndex) have same visual
                    const imageIndex = ((index + i) % 5) + 1;
                    const spotImage = `/thumbnails/spot${imageIndex}.png`;



                    // Determine SC rank for this specific link to ensure alternation
                    let scRank = 0;
                    for (let j = 0; j <= i; j++) {
                        if (displayLinks[j].includes('soundcloud')) scRank++;
                    }
                    // Pattern: (CardIndex + SC_Rank) % 2. 
                    // This guarantees that the 1st SC link is diff from 2nd SC link in this card.
                    const cloudIndex = ((index + scRank) % 2) + 1;
                    const cloudImage = `/thumbnails/cloud${cloudIndex}.png`;

                    // Modulo 4 for Amazon (4 images)
                    const amaIndex = ((index + i) % 4) + 1;
                    const amaImage = `/thumbnails/ama${amaIndex}.png`;

                    return <MediaGridItem key={i} link={link} index={i} total={displayLinks.length} spotImage={spotImage} cloudImage={cloudImage} amaImage={amaImage} />;
                })}
            </div>

            {/* Footer: Social Actions */}
            <div className="flex items-center justify-between pt-4 mt-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLikeClick}
                        className={`group flex items-center gap-1.5 transition-colors ${liked ? 'text-[#FB58B4]' : 'text-black/40 hover:text-[#FB58B4]'}`}
                    >
                        <Heart
                            className="w-5 h-5 group-hover:scale-110 transition-transform"
                            fill={liked ? "currentColor" : "none"}
                        />
                        <span className="text-xs font-bold">{likeCount}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onCommentClick) onCommentClick(playlist);
                        }}
                        className="group flex items-center gap-1.5 text-black/40 hover:text-blue-500 transition-colors"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">{comments}</span>
                    </button>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsShareModalOpen(true);
                    }}
                    className="text-black/40 hover:text-black transition-colors flex items-center gap-1"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            <SocialShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                playlist={playlist}
                thumbnail={(() => {
                    const firstLink = playlist?.links?.[0] || '';
                    if (!firstLink) return null;

                    let hostname = "";
                    try { hostname = new URL(firstLink).hostname.replace('www.', ''); } catch (e) { }

                    // Same logic as MediaGridItem for local images
                    const imageIndex = ((index + 0) % 5) + 1; // i=0
                    if (hostname.includes('spotify')) return `/thumbnails/spot${imageIndex}.png`;
                    if (hostname.includes('amazon')) return `/thumbnails/ama${((index + 0) % 4) + 1}.png`;

                    return null; // For fetchable links (Apple, YT), let Modal fetch it
                })()}
            />
        </motion.div>
    );
}

function MediaGridItem({ link, index, total, spotImage, cloudImage, amaImage }: { link: string, index: number, total: number, spotImage: string, cloudImage: string, amaImage: string }) {
    const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);

    let hostname = "";
    try { hostname = new URL(link).hostname.replace('www.', ''); } catch (e) { }

    useEffect(() => {
        const fetchMetadata = async () => {
            if (hostname.includes('apple') || hostname.includes('jiosaavn') || hostname.includes('saavn') || hostname.includes('gaana') || hostname.includes('youtube') || hostname.includes('youtu.be') || hostname.includes('soundcloud.com') || hostname.includes('on.soundcloud.com')) {
                try {
                    const res = await fetch(`/api/metadata?url=${encodeURIComponent(link)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.image) {
                            setFetchedThumbnail(data.image);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch metadata", e);
                }
            }
        };
        fetchMetadata();
    }, [link, hostname]);

    let bgClass = "bg-gray-100";
    let iconColor = "text-gray-400";
    let logoUrl = null;
    let thumbnail = null;

    if (hostname.includes('spotify')) {
        bgClass = "bg-[#1DB954]/10";
        iconColor = "text-[#1DB954]";
        logoUrl = "/images/spotify.png";
        thumbnail = spotImage; // Use local random thumbnail ONLY for Spotify
    }
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
        bgClass = "bg-[#FF0000]/10";
        iconColor = "text-[#FF0000]";
        logoUrl = "/images/ytmusic.png";
        thumbnail = fetchedThumbnail; // Use fetched ONLY
    }
    if (hostname.includes('apple')) {
        bgClass = "bg-[#FA243C]/10";
        iconColor = "text-[#FA243C]";
        logoUrl = "/images/apple.png";
        thumbnail = fetchedThumbnail; // Use fetched ONLY
    }
    if (hostname.includes('amazon')) {
        bgClass = "bg-[#25D1DA]/10";
        iconColor = "text-[#25D1DA]";
        logoUrl = "/images/amazon.png";
        thumbnail = amaImage; // Use local random thumbnail
    }
    if (hostname.includes('gaana')) {
        bgClass = "bg-[#E72C30]/10";
        iconColor = "text-[#E72C30]";
        logoUrl = "/images/gaana.png";
        thumbnail = fetchedThumbnail; // Use fetched ONLY
    }
    if (hostname.includes('jiosaavn') || hostname.includes('saavn')) {
        bgClass = "bg-[#2BC5B4]/10";
        iconColor = "text-[#2BC5B4]";
        logoUrl = "/images/saavn.png";
        thumbnail = fetchedThumbnail; // Use fetched ONLY
    }
    if (hostname.includes('soundcloud')) {
        bgClass = "bg-[#FF5500]/10";
        iconColor = "text-[#FF5500]";
        logoUrl = "/images/soundcloud.png";
        thumbnail = fetchedThumbnail; // Use fetched ONLY
    }

    const isSingle = total === 1;
    const isLastOdd = index === 2 && total === 3;

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative group/link overflow-hidden flex items-center justify-center transition-all duration-500 hover:z-10 hover:shadow-2xl hover:scale-[1.03] hover:-rotate-1 ${isSingle ? 'row-span-2 col-span-2' : ''} ${isLastOdd ? 'col-span-2 aspect-[2/1]' : ''} ${bgClass}`}
        >
            {/* Thumbnail Background if available */}
            {thumbnail && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={thumbnail}
                        className="w-full h-full object-cover opacity-100 group-hover/link:opacity-100 group-hover/link:saturate-150 transition-all duration-700 transform group-hover/link:scale-110"
                        alt="Cover"
                    />
                    {/* Gradient Overlay for drama */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-500" />
                </div>
            )}

            {/* Centered Icon/Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/link:top-[calc(100%-1.25rem)] group-hover/link:left-[1.25rem] group-hover/link:-translate-y-full group-hover/link:translate-x-0 z-20">
                <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 group-hover/link:bg-white group-hover/link:shadow-xl transition-all">
                    {logoUrl ? (
                        <img src={logoUrl} className="w-8 h-8 object-contain drop-shadow-sm" />
                    ) : (
                        <Music2 className={`w-8 h-8 ${iconColor}`} />
                    )}
                </div>
            </div>
        </a>
    );
}
