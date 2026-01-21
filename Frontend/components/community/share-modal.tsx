"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidMusicLink } from '@/lib/validators';
import { shareCustomPlaylist, updateCustomPlaylist } from '@/lib/supabase';
import { toast } from 'sonner';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess?: (result?: any) => void;
    initialData?: any;
}

export function ShareModal({ isOpen, onClose, userId, onSuccess, initialData }: ShareModalProps) {
    const [emotion, setEmotion] = useState('');
    const [tagline, setTagline] = useState('');
    const [currentLink, setCurrentLink] = useState('');
    const [links, setLinks] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setEmotion(initialData.emotion || '');
                setTagline(initialData.tagline || '');
                setLinks(initialData.links || []);
            } else {
                setEmotion('');
                setTagline('');
                setLinks([]);
            }
            setCurrentLink('');
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleAddLink = () => {
        setError(null);
        if (!currentLink) return;

        if (!isValidMusicLink(currentLink)) {
            setError("Only Spotify, Apple Music, Amazon Music, YouTube, Gaana, JioSaavn, and SoundCloud links are allowed.");
            return;
        }

        if (links.includes(currentLink)) {
            setError("Link already added.");
            return;
        }

        if (links.length >= 5) {
            setError("Maximum 5 links per post.");
            return;
        }

        setLinks([...links, currentLink]);
        setCurrentLink('');
    };

    const handleRemoveLink = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!emotion.trim()) {
            setError("Please describe the emotion.");
            return;
        }
        if (links.length === 0) {
            setError("Please add at least one music link.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            let result;
            if (initialData) {
                // Update Mode
                result = await updateCustomPlaylist(initialData.id, emotion, links, tagline);
                toast.success("Vibe updated successfully!");
            } else {
                // Create Mode
                // Note: shareCustomPlaylist returns { data, error }, we need to handle that structure
                const { data } = await shareCustomPlaylist(userId, emotion, links, tagline);
                result = data ? data[0] : null; // insert returns array
                toast.success("Vibe shared successfully!");
            }

            if (onSuccess && result) onSuccess(result);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to share vibe.");
        } finally {
            setIsSubmitting(false);
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
                        className="fixed inset-0 bg-black/20 backdrop-blur-md z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-lg rounded-[32px] border border-black/5 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">

                            {/* Header */}
                            <div className="bg-white p-4 md:p-6 border-b border-black/5 flex items-center justify-between">
                                <h2 className="text-lg md:text-xl font-black uppercase text-black tracking-tight">
                                    {initialData ? 'Edit Vibe' : 'Share Custom Vibe'}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 text-black/60 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 md:space-y-6">

                                {/* Emotion Input */}
                                <div className="space-y-2">
                                    <label className="font-bold uppercase text-xs tracking-wider opacity-50">Emotion / Vibe Name</label>
                                    <input
                                        type="text"
                                        value={emotion}
                                        onChange={(e) => setEmotion(e.target.value)}
                                        placeholder="e.g., Midnight Drive"
                                        className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2 md:px-4 md:py-3 font-bold focus:outline-none focus:border-black/20 focus:bg-white transition-all text-sm md:text-base"
                                    />
                                </div>

                                {/* Tagline Input */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="font-bold uppercase text-xs tracking-wider opacity-50">Tagline</label>
                                        <span className="text-[10px] font-bold opacity-30">{tagline.length}/60</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={tagline}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 60) {
                                                setTagline(e.target.value);
                                            }
                                        }}
                                        placeholder="Short vibe description..."
                                        className="w-full bg-gray-50 border border-black/5 rounded-xl px-3 py-2 md:px-4 md:py-3 font-medium focus:outline-none focus:border-black/20 focus:bg-white transition-all text-sm md:text-base"
                                    />
                                </div>

                                {/* Link Input */}
                                <div className="space-y-2">
                                    <label className="font-bold uppercase text-xs tracking-wider opacity-50">Add Music Links</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={currentLink}
                                            onChange={(e) => setCurrentLink(e.target.value)}
                                            placeholder="Paste URL (Spotify, YouTube...)"
                                            className="flex-1 bg-gray-50 border border-black/5 rounded-xl px-3 py-2 md:px-4 md:py-3 font-medium focus:outline-none focus:border-black/20 focus:bg-white transition-all text-sm md:text-base min-w-0"
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                                        />
                                        <button
                                            onClick={handleAddLink}
                                            className="bg-black text-white px-3 md:px-4 rounded-xl hover:bg-zinc-800 transition-colors shrink-0"
                                        >
                                            <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-black/30 uppercas tracking-wide leading-tight">
                                        Spotify • Apple • Amazon • YouTube • Gaana • JioSaavn • SoundCloud
                                    </p>
                                </div>

                                {/* Link List */}
                                <div className="space-y-2 md:space-y-3">
                                    {links.map((link, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center justify-between bg-white border border-black/5 p-2 md:p-3 rounded-2xl group shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0 flex-1">
                                                <div className="w-6 h-6 md:w-8 md:h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0 text-green-600">
                                                    <LinkIcon className="w-3 h-3 md:w-4 md:h-4" />
                                                </div>
                                                <span className="text-xs md:text-sm font-medium truncate opacity-70 flex-1 min-w-0">{link}</span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveLink(idx)}
                                                className="p-1 md:p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors md:opacity-0 md:group-hover:opacity-100 shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {links.length === 0 && (
                                        <div className="text-center p-4 md:p-6 border border-dashed border-black/10 rounded-2xl text-black/30 font-medium text-xs md:text-sm">
                                            No links added yet. Be the first to share!
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 text-red-600 p-3 md:p-4 rounded-xl flex items-center gap-3 text-xs md:text-sm font-medium"
                                    >
                                        <AlertCircle className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 md:p-6 border-t border-black/5 bg-gray-50/50">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || links.length === 0 || !emotion}
                                    className="w-full bg-black text-white font-bold uppercase text-xs md:text-sm py-3 md:py-4 rounded-xl hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {initialData ? 'Update Vibe' : 'Post Vibe'}
                                            <CheckCircle2 className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
