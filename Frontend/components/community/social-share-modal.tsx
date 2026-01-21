"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, ExternalLink, Mail, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { VibeBadge } from '@/components/community/vibe-badge';


import { toBlob } from 'html-to-image';
import { useRef } from 'react';

export function SocialShareModal({ isOpen, onClose, playlist, thumbnail }: { isOpen: boolean, onClose: () => void, playlist: any, thumbnail?: string | null }) {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [mounted, setMounted] = useState(false);
    const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined' && playlist?.id) {
            setShareUrl(`${window.location.origin}/community/${playlist.id}`);
        }
    }, [playlist]);

    // Fetch thumbnail if not provided
    useEffect(() => {
        const firstLink = playlist?.links?.[0];
        if (!thumbnail && firstLink) {
            let hostname = "";
            try { hostname = new URL(firstLink).hostname.replace('www.', ''); } catch (e) { }

            if (hostname.includes('apple') || hostname.includes('jiosaavn') || hostname.includes('saavn') || hostname.includes('gaana') || hostname.includes('youtube') || hostname.includes('youtu.be') || hostname.includes('soundcloud.com') || hostname.includes('on.soundcloud.com')) {
                fetch(`/api/metadata?url=${encodeURIComponent(firstLink)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.image) setFetchedThumbnail(data.image);
                    })
                    .catch(err => console.error("Failed to fetch metadata in share modal", err));
            }
        }
    }, [playlist, thumbnail]);

    const activeThumbnail = thumbnail || fetchedThumbnail || "/thumbnails/spot1.png"; // Fallback

    const shareData = {
        title: `Check out this ${playlist?.emotion} vibe`,
        text: `Give this playlist a listen: ${playlist?.emotion}`,
        url: shareUrl
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const handleShare = async (platform?: string) => {
        setIsGeneratingImage(true);
        const messageWithLink = `${shareData.text}\n\n${shareData.url}`;

        // Feature: For WhatsApp (and native), try to share the Image + Text via Native Share Sheet first.
        // This is the only way to "share image" to WhatsApp from a web app on mobile.
        // Also applying for Instagram as requested. Twitter/X will use text-only intent.
        if ((platform === 'whatsapp' || platform === 'instagram' || platform === 'native' || !platform) && navigator.share && previewRef.current) {
            try {
                const blob = await toBlob(previewRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 });
                if (blob) {
                    const file = new File([blob], 'moodmate-vibe.png', { type: 'image/png' });

                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        // Workaround: Some apps/devices ignore 'text' when sharing files. 
                        // We copy the text to clipboard so the user can paste it if needed.
                        try {
                            await navigator.clipboard.writeText(messageWithLink);
                            toast.success("Caption copied! Paste it if missing.");
                        } catch (e) {
                            // Ignore clipboard error
                        }

                        await navigator.share({
                            files: [file],
                            title: shareData.title,
                            text: messageWithLink,
                        });
                        setIsGeneratingImage(false);
                        return; // Success!
                    }
                }
            } catch (err) {
                console.log("Native file share failed/unsupported, falling back to intent.", err);
                // Fallback will happen below
            }
        }

        setIsGeneratingImage(false);

        // 2. Fallback to Web Intents (Text + Link only)
        if (platform === 'twitter') {
            const tweetText = encodeURIComponent(shareData.text);
            const tweetUrl = encodeURIComponent(shareData.url);
            window.open(`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`, '_blank');
        } else if (platform === 'whatsapp') {
            // Fallback for WhatsApp (Desktop or non-supported mobile browsers): Text + Link
            const waText = encodeURIComponent(messageWithLink);
            window.open(`https://wa.me/?text=${waText}`, '_blank');
        } else if (platform === 'facebook') {
            const fbUrl = encodeURIComponent(shareData.url);
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, '_blank');
        } else if (platform === 'gmail') {
            const subject = encodeURIComponent(shareData.title);
            const body = encodeURIComponent(messageWithLink);
            window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        } else if (platform === 'instagram') {
            // Instagram doesn't have a direct web intent for sharing image/text to feed/stories easily without native API
            toast.info("Open Instagram on your mobile to share this vibe!");
        } else if (platform === 'native') {
            // Native fallback without image (if image gen failed but share is supported)
            if (navigator.share) {
                navigator.share({
                    title: shareData.title,
                    text: messageWithLink,
                }).catch(console.error);
            } else {
                toast.error("Sharing not supported on this device.");
            }
        }
    };

    if (!mounted) return null;

    // Helper to get platform info
    const getPlatformInfo = (link: string) => {
        let hostname = "";
        try { hostname = new URL(link).hostname.replace('www.', ''); } catch (e) { }

        if (hostname.includes('spotify')) return { name: 'Spotify', icon: 'https://img.icons8.com/?size=100&id=G9XXzb9XaEKX&format=png&color=000000', color: '#1DB954' };
        if (hostname.includes('youtube')) return { name: 'YouTube Music', icon: 'https://img.icons8.com/?size=100&id=V1cbDThDpbRc&format=png&color=000000', color: '#FF0000' };
        if (hostname.includes('apple')) return { name: 'Apple Music', icon: 'https://img.icons8.com/?size=100&id=81TSi6Gqk0tm&format=png&color=000000', color: '#FA243C' };
        if (hostname.includes('amazon')) return { name: 'Amazon Music', icon: 'https://img.icons8.com/?size=100&id=lxwUaALAeQmr&format=png&color=000000', color: '#25D1DA' };
        if (hostname.includes('gaana')) return { name: 'Gaana', icon: 'https://img.icons8.com/?size=100&id=CB8RecJzLKk2&format=png&color=000000', color: '#E72C30' };
        if (hostname.includes('jiosaavn') || hostname.includes('saavn')) return { name: 'JioSaavn', icon: 'https://img.icons8.com/?size=100&id=wVpEITQRmAA5&format=png&color=000000', color: '#2BC5B4' };
        if (hostname.includes('soundcloud')) return { name: 'SoundCloud', icon: 'https://img.icons8.com/?size=100&id=13669&format=png&color=000000', color: '#FF5500' };

        return { name: 'Link', icon: '', color: '#000000' };
    };

    const firstLink = playlist?.links?.[0] || '';
    const platform = getPlatformInfo(firstLink);
    const profile = playlist?.profile || {};
    const displayName = profile.full_name || "Music Lover";
    const avatarSrc = profile.avatar_url;

    // Format date similar to image
    const dateStr = new Date(playlist?.created_at || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Mock initials
    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return createPortal(
        <>
            {/* Hidden Capture Template (Off-screen) */}
            {/* We render this always (or when open) so it's ready for capture. 
                Fixed width ensures consistent image size. 
                Using fixed positioning off-screen is safer for capture. */}
            <div
                className="fixed top-0 left-0 -z-50 pointer-events-none"
                style={{ transform: 'translateX(-9999px)' }}
            >
                <div ref={previewRef} className="w-[600px] bg-white rounded-[40px] overflow-hidden border border-black/5 flex flex-col shadow-2xl">
                    {/* Card Content for Image */}
                    <div className="p-8 pb-8">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 mb-0">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-full border border-black/10 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 ring-4 ring-yellow-400">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-sm text-black/80">{getInitials(displayName)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl leading-none">{displayName}</h3>
                                        <p className="text-sm font-medium text-black/40 mt-1">{dateStr}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <VibeBadge emotion={playlist?.emotion} className="text-sm scale-110 origin-top-right" />
                                </div>
                            </div>

                            {/* Main Text */}
                            <div className="mb-8">
                                <h2 className="text-4xl font-black leading-tight mb-3">
                                    Feeling <span className="text-[#8B5CF6]">{playlist?.emotion}</span> today.
                                </h2>
                                {playlist?.tagline && (
                                    <p className="text-xl text-black/50 font-medium italic">"{playlist.tagline}"</p>
                                )}
                            </div>

                            {/* Footer / Link */}
                            <div className="flex gap-4 items-stretch h-24">
                                {/* Link Pill */}
                                <div className={`flex-1 rounded-2xl flex items-center px-6 gap-4 bg-opacity-10`} style={{ backgroundColor: `${platform.color}15` }}>
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 p-2">
                                        {platform.icon ? <img src={platform.icon} className="w-full h-full object-contain" /> : <ExternalLink className="w-6 h-6 opacity-50" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-base truncate text-black/80">Listen on {platform.name}</p>
                                        <p className="text-xs font-bold uppercase tracking-wider text-black/40" style={{ color: platform.color }}>Click to Play</p>
                                    </div>
                                </div>

                                {/* Right Abstract Box (Mock Thumbnail) */}
                                <div className="w-24 rounded-2xl bg-black overflow-hidden relative shrink-0">
                                    <img src={activeThumbnail} className="w-full h-full object-cover opacity-80" alt="Cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Branding */}
                    <div className="bg-yellow-400 py-6 px-8 text-center border-t border-black/5">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <img src="/images/logo.png" className="w-6 h-6 object-contain" alt="MoodMate" />
                            <span className="font-black text-black uppercase tracking-tight text-xl">MoodMate</span>
                        </div>
                        <p className="text-xs uppercase tracking-widest text-black/40 font-bold">
                            Crafted with <span className="text-[#FB58B4]">♥</span> by Ranit Deria
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-white w-full max-w-lg rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col relative border border-black/5">

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-1.5 md:p-2 bg-black text-white hover:bg-zinc-800 rounded-full transition-transform hover:scale-110 shadow-lg"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>

                                {/* Content */}
                                <div className="p-5 md:p-8 pb-0 md:pb-0">
                                    {/* Preview Card - Mimicking the design */}
                                    <div className="bg-white rounded-[24px] md:rounded-[32px] p-3 md:p-6 shadow-xl border border-black/5 mb-4 md:mb-8 transform transition-transform hover:scale-[1.02] duration-500">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-4 md:mb-6">
                                            <div className="flex gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-black/10 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 ring-2 md:ring-4 ring-yellow-400">
                                                    {avatarSrc ? (
                                                        <img src={avatarSrc} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-black text-[10px] md:text-sm text-black/80">{getInitials(displayName)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm md:text-lg leading-none">{displayName}</h3>
                                                    <p className="text-[9px] md:text-xs font-medium text-black/40 mt-1">{dateStr}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mr-8 md:mr-0">
                                                <VibeBadge emotion={playlist?.emotion} className="text-[9px] md:text-xs scale-90 md:scale-100 origin-top-right" />
                                            </div>
                                        </div>

                                        {/* Main Text */}
                                        <div className="mb-3 md:mb-6">
                                            <h2 className="text-lg md:text-3xl font-black leading-tight mb-1 md:mb-2">
                                                Feeling <span className="text-[#8B5CF6]">{playlist?.emotion}</span> today.
                                            </h2>
                                            {playlist?.tagline && (
                                                <p className="text-xs md:text-lg text-black/50 font-medium italic">"{playlist.tagline}"</p>
                                            )}
                                        </div>

                                        {/* Footer / Link */}
                                        <div className="flex gap-2 md:gap-4 items-stretch h-12 md:h-20">
                                            {/* Link Pill */}
                                            <div className={`flex-1 rounded-xl md:rounded-2xl flex items-center px-2 md:px-4 gap-2 md:gap-3 bg-opacity-10`} style={{ backgroundColor: `${platform.color}15` }}>
                                                <div className="w-6 h-6 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center shrink-0 p-1 md:p-1.5">
                                                    {platform.icon ? <img src={platform.icon} className="w-full h-full object-contain" /> : <ExternalLink className="w-3 h-3 md:w-5 md:h-5 opacity-50" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[10px] md:text-sm truncate text-black/80">Listen on {platform.name}</p>
                                                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider text-black/40" style={{ color: platform.color }}>Click to Play</p>
                                                </div>
                                            </div>

                                            {/* Right Abstract Box (Mock Thumbnail) */}
                                            <div className="w-12 md:w-20 rounded-xl md:rounded-2xl bg-black overflow-hidden relative shrink-0">
                                                <img src={activeThumbnail} className="w-full h-full object-cover opacity-80" alt="Cover" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Share Actions */}
                                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6">
                                        <button onClick={handleCopy} className={`p-3 md:p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 border-transparent ${copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white hover:bg-gray-50 border-black/5'}`}>
                                            {copied ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <Copy className="w-5 h-5 md:w-6 md:h-6 text-black/40" />}
                                            <span className="text-[10px] md:text-xs uppercase tracking-wider text-black/60">{copied ? 'Copied!' : 'Copy Link'}</span>
                                        </button>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Apps for mobile/tablet</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button onClick={() => handleShare('whatsapp')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                                    <img src="https://img.icons8.com/?size=100&id=16713&format=png&color=FFFFFF" className="w-5 h-5 md:w-8 md:h-8" alt="WhatsApp" />
                                                </button>
                                                <button onClick={() => handleShare('twitter')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200 border border-white/10">
                                                    <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-6 md:h-6" fill="currentColor">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleShare('instagram')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                                    <Instagram className="w-4 h-4 md:w-7 md:h-7" />
                                                </button>
                                                <button onClick={() => handleShare('facebook')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                                    <Facebook className="w-4 h-4 md:w-7 md:h-7" />
                                                </button>
                                                <button onClick={() => handleShare('gmail')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-[#EA4335] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                                    <Mail className="w-4 h-4 md:w-7 md:h-7" />
                                                </button>
                                                <button onClick={() => handleShare('native')} className="h-10 md:h-14 rounded-full md:rounded-2xl bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200">
                                                    <ExternalLink className="w-4 h-4 md:w-7 md:h-7" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer / Branding */}
                                <div className="bg-yellow-400 py-4 px-6 text-center border-t border-black/5">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <img src="/images/logo.png" className="w-5 h-5 object-contain" alt="MoodMate" />
                                        <span className="font-black text-black uppercase tracking-tight text-lg">MoodMate</span>
                                    </div>
                                    <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">
                                        Crafted with <span className="text-[#FB58B4]">♥</span> by Ranit Deria
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>,
        document.body
    );
}
