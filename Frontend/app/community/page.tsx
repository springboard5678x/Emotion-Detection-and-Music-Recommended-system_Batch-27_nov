"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareModal } from '@/components/community/share-modal';
import { VibeDetailsModal } from '@/components/community/vibe-details-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { SearchFilterBar } from '@/components/community/search-filter-bar';
import { VibeCard } from '@/components/community/vibe-card';
import { getCommunityPlaylists, toggleLike, deletePlaylist } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CommunityPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVibeId, setSelectedVibeId] = useState<string | null>(null);
    const [selectedVibeImage, setSelectedVibeImage] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [scrollToComments, setScrollToComments] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null); // For editing
    const [user, setUser] = useState<User | null>(null);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Latest');
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            fetchPlaylists(user?.id); // Fetch with ID to get 'is_liked'
        };
        checkUser();
    }, []);

    const fetchPlaylists = async (userId?: string, filter: string = activeFilter, updatedPlaylist?: any) => {
        // Optimistic Update Handling
        if (updatedPlaylist) {
            setPlaylists(prev => {
                const exists = prev.find(p => p.id === updatedPlaylist.id);
                if (exists) {
                    return prev.map(p => p.id === updatedPlaylist.id ? { ...p, ...updatedPlaylist } : p);
                } else {
                    // Prepend new playlist
                    // We need to reshape it slightly to match the joined structure (profile, etc) temporarily
                    // Ideally we'd have the profile handy, but we can fall back to the existing user session
                    const newVibe = {
                        ...updatedPlaylist,
                        profile: user?.user_metadata ? {
                            full_name: user.user_metadata.full_name,
                            avatar_url: user.user_metadata.avatar_url
                        } : null,
                        is_liked: false,
                        likes: 0,
                        comments: 0
                    };
                    return [newVibe, ...prev];
                }
            });
            // Don't set loading true for optimistic updates, just silent refresh
        } else {
            setLoading(true);
        }

        try {
            // Cast filter to expected type
            const { data, error } = await getCommunityPlaylists(userId, filter as 'Latest' | 'Popular' | 'Trending');
            if (error) throw error;
            setPlaylists(data || []);
        } catch (error) {
            console.error("Error fetching playlists:", error);
            // Don't show toast on background refresh failures to avoid annoying user
            if (!updatedPlaylist) toast.error("Failed to load community vibes.");
        } finally {
            setLoading(false);
        }
    };

    const handleShareClick = () => {
        if (!user) {
            toast.error("Please login to share your vibe!");
            return;
        }
        setEditData(null); // Clear edit mode
        setIsModalOpen(true);
    };

    // Actions
    const handleLikeToggle = async (playlistId: string, isLiked: boolean) => {
        if (!user) return;
        try {
            await toggleLike(user.id, playlistId);
            // We don't need to re-fetch entire list, local state in VibeCard handles optimistic UI.
            // But if we wanted perfect sync we could refresh silently.
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to update like.");
        }
    };

    const handleDeleteClick = (playlistId: string) => {
        setDeleteId(playlistId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await deletePlaylist(deleteId);
            toast.success("Vibe deleted successfully!");
            setPlaylists(prev => prev.filter(p => p.id !== deleteId));
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Failed to delete vibe.");
        }
    };

    const handleEdit = (playlist: any) => {
        setEditData(playlist);
        setIsModalOpen(true);
    };

    // Filter Logic
    const filteredPlaylists = playlists.filter(playlist => {
        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return playlist.emotion.toLowerCase().includes(query);
        }
        return true;
    });

    const handleVibeUpdate = (updatedVibe: any) => {
        setPlaylists(prev => prev.map(p => p.id === updatedVibe.id ? { ...p, ...updatedVibe } : p));
    };

    return (
        <main className="min-h-screen bg-[#FFF8F0] p-4 pt-24 md:p-8 md:pt-28 relative overflow-hidden">
            {/* Floating Background Effects */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute -bottom-8 left-20 w-80 h-80 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-4">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-5xl font-black uppercase tracking-tight"
                            >
                                Community <span className="text-[#7c3aed]">Feed</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-bold text-black/60 text-lg mt-2 max-w-xl"
                            >
                                See what the world is listening to right now.
                            </motion.p>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <SearchFilterBar
                            onSearch={setSearchQuery}
                            activeFilter={activeFilter}
                            onFilterChange={(filter) => {
                                setActiveFilter(filter);
                                fetchPlaylists(user?.id, filter);
                            }}
                            onCreatePost={handleShareClick}
                        />
                    </motion.div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-10 h-10 animate-spin text-black/20" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredPlaylists.map((playlist, idx) => (
                                <VibeCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    index={idx}
                                    currentUserId={user?.id}
                                    onLikeToggle={handleLikeToggle}
                                    onDelete={handleDeleteClick}
                                    onEdit={handleEdit}
                                    onClick={(p) => {
                                        // Calculate the main thumbnail for this card (using first link logic to match VibeCard)
                                        const firstLink = p.links && p.links.length > 0 ? p.links[0] : '';
                                        let hostname = "";
                                        try { hostname = new URL(firstLink).hostname.replace('www.', ''); } catch (e) { }

                                        let thumbnail = null; // Default to null for fetchable sources

                                        if (hostname.includes('spotify')) {
                                            thumbnail = `/thumbnails/spot${((idx + 0) % 5) + 1}.png`;
                                        } else if (hostname.includes('soundcloud')) {
                                            // SC logic for i=0: rank=1. Pattern: (CardIndex + Rank) % 2
                                            const cloudIndex = ((idx + 1) % 2) + 1;
                                            thumbnail = `/thumbnails/cloud${cloudIndex}.png`;
                                        } else if (hostname.includes('amazon')) {
                                            // Amazon logic: (CardIndex + LinkIndex) % 4
                                            const amaIndex = ((idx + 0) % 4) + 1;
                                            thumbnail = `/thumbnails/ama${amaIndex}.png`;
                                        }
                                        // For others (YT, Apple, etc.), passes null so Modal fetches self.

                                        setSelectedVibeId(p.id);
                                        setSelectedVibeImage(thumbnail);
                                        setScrollToComments(false);
                                        setIsDetailsOpen(true);
                                    }}
                                    onCommentClick={(p) => {
                                        // Same logic as onClick
                                        const firstLink = p.links && p.links.length > 0 ? p.links[0] : '';
                                        let hostname = "";
                                        try { hostname = new URL(firstLink).hostname.replace('www.', ''); } catch (e) { }

                                        let thumbnail = null;

                                        if (hostname.includes('spotify')) {
                                            thumbnail = `/thumbnails/spot${((idx + 0) % 5) + 1}.png`;
                                        } else if (hostname.includes('soundcloud')) {
                                            const cloudIndex = ((idx + 1) % 2) + 1;
                                            thumbnail = `/thumbnails/cloud${cloudIndex}.png`;
                                        } else if (hostname.includes('amazon')) {
                                            const amaIndex = ((idx + 0) % 4) + 1;
                                            thumbnail = `/thumbnails/ama${amaIndex}.png`;
                                        }

                                        setSelectedVibeId(p.id);
                                        setSelectedVibeImage(thumbnail);
                                        setScrollToComments(true);
                                        setIsDetailsOpen(true);
                                    }}
                                    onShowToast={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
                                />
                            ))}
                        </AnimatePresence>

                        {filteredPlaylists.length === 0 && (
                            <div className="col-span-full py-20 text-center flex flex-col items-center">
                                <p className="text-xl font-bold text-black/40">No vibes found matching your criteria.</p>
                                <button onClick={() => { setSearchQuery(''); setActiveFilter('Latest'); }} className="mt-4 text-[#FB58B4] font-bold hover:underline">Clear Filters</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={user?.id || ''}
                onSuccess={(result) => fetchPlaylists(user?.id, activeFilter, result)}
                initialData={editData}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Vibe?"
                message="Are you sure you want to remove this vibe from the community? This action cannot be undone."
                confirmText="Delete Vibe"
                isDestructive={true}
            />

            <VibeDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setScrollToComments(false); // Reset on close
                }}
                playlistId={selectedVibeId}
                selectedImage={selectedVibeImage}
                currentUserId={user?.id}
                onUpdate={handleVibeUpdate}
                scrollToComments={scrollToComments}
            />
        </main>
    );
}
