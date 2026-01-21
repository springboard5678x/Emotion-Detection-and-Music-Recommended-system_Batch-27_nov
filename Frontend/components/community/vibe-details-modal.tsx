"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { VibeDetailedCard } from '@/components/community/vibe-detailed-card';
import { CommentSection } from '@/components/community/comment-section';
import { X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getVibeById, getComments, toggleLike } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface VibeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlistId: string | null;
    selectedImage?: string | null;
    currentUserId?: string;
    onUpdate?: (updatedVibe: any) => void;
    initialData?: any;
    scrollToComments?: boolean;
}

export function VibeDetailsModal({ isOpen, onClose, playlistId, selectedImage, currentUserId, initialData, onUpdate, scrollToComments }: VibeDetailsModalProps) {
    const [vibe, setVibe] = useState<any>(initialData || null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const commentSectionRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen && playlistId) {
            fetchData(playlistId);
        } else {
            // Reset state when closed
            setVibe(null);
            setComments([]);
            setLoading(true);
        }
    }, [isOpen, playlistId]);

    // Auto-scroll when data loads and scrollToComments is true
    useEffect(() => {
        if (!loading && vibe && scrollToComments && commentSectionRef.current) {
            setTimeout(() => {
                commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 300); // Slight delay to ensure content layout is stable
        }
    }, [loading, vibe, scrollToComments]);

    const fetchData = async (id: string) => {
        setLoading(true);
        try {
            const [vibeRes, commentsRes] = await Promise.all([
                getVibeById(id, currentUserId),
                getComments(id, currentUserId)
            ]);

            if (vibeRes.error) throw vibeRes.error;
            if (commentsRes.error) throw commentsRes.error;

            setVibe(vibeRes.data);
            setComments(commentsRes.data || []);

            // Notify parent of updates
            if (onUpdate && vibeRes.data) {
                onUpdate(vibeRes.data);
            }
        } catch (error) {
            console.error("Error loading vibe details:", error);
            toast.error("Failed to load details.");
        } finally {
            setLoading(false);
        }
    };

    const handleLikeToggle = async (id: string, isLiked: boolean) => {
        if (!currentUserId) {
            toast.error("Please login to like!");
            return;
        }
        try {
            await toggleLike(currentUserId, id);
            // Refresh data to update counts and notify parent
            fetchData(id);
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
                    >
                        <div className="bg-[#FFF8F0] w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative border border-black/10">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 z-20 p-2 bg-white/50 backdrop-blur-md text-red-500 hover:bg-red-50 rounded-full transition-all border border-black/5 shadow-sm"
                            >
                                <X className="w-5 h-5 currentColor" />
                            </button>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {(loading && !vibe) ? (
                                    <div className="flex items-center justify-center h-full min-h-[400px]">
                                        <Loader2 className="w-10 h-10 animate-spin text-black/20" />
                                    </div>
                                ) : (
                                    <div className="p-6 md:p-8 space-y-8">
                                        <VibeDetailedCard
                                            playlist={vibe}
                                            currentUserId={currentUserId}
                                            onLikeToggle={handleLikeToggle}
                                            thumbnail={selectedImage}
                                        />

                                        <div ref={commentSectionRef} className="bg-white rounded-[40px] border border-black/5 p-8 shadow-sm">
                                            <CommentSection
                                                playlistId={playlistId!}
                                                comments={comments}
                                                currentUserId={currentUserId}
                                                onCommentAdded={() => fetchData(playlistId!)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
