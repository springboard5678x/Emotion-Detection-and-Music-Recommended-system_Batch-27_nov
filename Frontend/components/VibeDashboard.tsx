"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VibeAnalytics } from "@/components/VibeAnalytics"
import { VibeCard } from "@/components/community/vibe-card"
import { VibeDetailsModal } from '@/components/community/vibe-details-modal'
import { ShareModal } from '@/components/community/share-modal'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { toast } from 'sonner'
import { Loader2, Sparkles, Layers, Activity } from 'lucide-react'

// Types (simplified based on usage)
interface Playlist {
    id: string
    user_id: string
    emotion: string
    tagline?: string
    links: string[]
    created_at: string
    likes: number
    comments: number
    is_liked?: boolean
    profile?: {
        full_name?: string
        avatar_url?: string
    }
}

export function VibeDashboard({ userId }: { userId: string }) {
    const [myPosts, setMyPosts] = useState<Playlist[]>([])
    const [commentedPlaylists, setCommentedPlaylists] = useState<Playlist[]>([])
    const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedVibeId, setSelectedVibeId] = useState<string | null>(null)
    const [selectedVibeImage, setSelectedVibeImage] = useState<string | null>(null)
    const [scrollToComments, setScrollToComments] = useState(false)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editData, setEditData] = useState<any>(null)

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const supabase = createClient()

    // Helper to fetch data (same as before)
    const fetchData = async () => {
        console.log("Fetching Vibe Dashboard data for user:", userId)
        setLoading(true)
        try {
            const [profileResult, postsResult, commentsResult, likesResult] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('community_playlists').select('*, playlist_likes(count), comments(count)').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('comments').select('playlist_id').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('playlist_likes').select('playlist_id').eq('user_id', userId)
            ])

            if (postsResult.error) throw postsResult.error
            if (commentsResult.error) throw commentsResult.error

            const currentUserProfile = profileResult.data
            const postsData = postsResult.data || []
            const commentsData = commentsResult.data || []
            const userLikes = likesResult.data || []
            const likedPlaylistIds = new Set(userLikes.map((l: any) => l.playlist_id))

            // Commented Playlists
            let commentedPlaylistsRaw: any[] = []
            const commentedPlaylistIds = Array.from(new Set(commentsData.map((c: any) => c.playlist_id)))

            if (commentedPlaylistIds.length > 0) {
                const { data: playlistsData, error: playlistsError } = await supabase
                    .from('community_playlists')
                    .select('*, playlist_likes(count), comments(count)')
                    .in('id', commentedPlaylistIds)

                if (playlistsError) throw playlistsError
                commentedPlaylistsRaw = playlistsData || []
            }

            // Liked Playlists (Fetch details for "My Likes" tab)
            let likedPlaylistsRaw: any[] = []
            const likedPlaylistIdsArray = Array.from(likedPlaylistIds)

            if (likedPlaylistIdsArray.length > 0) {
                const { data: likedData, error: likedError } = await supabase
                    .from('community_playlists')
                    .select('*, playlist_likes(count), comments(count)')
                    .in('id', likedPlaylistIdsArray)

                if (likedError) throw likedError
                likedPlaylistsRaw = likedData || []
            }

            // Profiles
            const allUserIds = new Set([
                ...postsData.map((p: any) => p.user_id),
                ...commentedPlaylistsRaw.map((p: any) => p.user_id),
                ...likedPlaylistsRaw.map((p: any) => p.user_id)
            ])

            let profilesMap: Record<string, any> = {}
            if (allUserIds.size > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', Array.from(allUserIds))

                if (profilesData) {
                    profilesData.forEach((p: any) => profilesMap[p.id] = p)
                }
            }

            // Stitch
            const myPostsFinal = postsData.map((p: any) => ({
                ...p,
                profile: profilesMap[p.user_id] || currentUserProfile,
                is_liked: likedPlaylistIds.has(p.id),
                likes: p.playlist_likes?.[0]?.count || 0,
                comments: p.comments?.[0]?.count || 0
            }))

            const commentedPlaylistsFinal = commentedPlaylistsRaw.map((p: any) => ({
                ...p,
                profile: profilesMap[p.user_id],
                is_liked: likedPlaylistIds.has(p.id),
                likes: p.playlist_likes?.[0]?.count || 0,
                comments: p.comments?.[0]?.count || 0
            }))

            const likedPlaylistsFinal = likedPlaylistsRaw.map((p: any) => ({
                ...p,
                profile: profilesMap[p.user_id],
                is_liked: true, // By definition
                likes: p.playlist_likes?.[0]?.count || 0,
                comments: p.comments?.[0]?.count || 0
            }))

            const commentedPlaylistsSorted = commentedPlaylistIds
                .map(id => commentedPlaylistsFinal.find((p: any) => p.id === id))
                .filter(p => p !== undefined)

            setMyPosts(myPostsFinal)
            setCommentedPlaylists(commentedPlaylistsSorted)
            setLikedPlaylists(likedPlaylistsFinal)

        } catch (e) {
            console.error("Error loading dashboard:", e)
            toast.error("Failed to load your vibe history.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userId) fetchData()
    }, [userId, supabase])

    // --- Actions ---

    const handleLikeToggle = async (playlistId: string, isLiked: boolean) => {
        setMyPosts(current => current.map(p => p.id === playlistId ? { ...p, is_liked: isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 } : p))
        setCommentedPlaylists(current => current.map(p => p.id === playlistId ? { ...p, is_liked: isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 } : p))

        if (!isLiked) {
            // Remove from liked list
            setLikedPlaylists(current => current.filter(p => p.id !== playlistId))
        } else {
            // Note: Adding requires full object, which we don't have here easily without re-fetching.
            // Ideally we'd grab it from one of the other lists if present
            const found = myPosts.find(p => p.id === playlistId) || commentedPlaylists.find(p => p.id === playlistId)
            if (found) {
                setLikedPlaylists(current => [...current, { ...found, is_liked: true, likes: found.likes + 1 }])
            }
        }

        try {
            if (isLiked) {
                const { error } = await supabase.from('playlist_likes').insert({ user_id: userId, playlist_id: playlistId })
                if (error) throw error
            } else {
                const { error } = await supabase.from('playlist_likes').delete().eq('user_id', userId).eq('playlist_id', playlistId)
                if (error) throw error
            }
        } catch (e) {
            console.error("Error toggling like:", e)
            toast.error("Failed to update like")
        }
    }

    const triggerDelete = (playlistId: string) => {
        setDeleteId(playlistId)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteId) return

        // Optimistic UI update
        setMyPosts(current => current.filter(p => p.id !== deleteId))
        setCommentedPlaylists(current => current.filter(p => p.id !== deleteId)) // In case I commented on my own post

        try {
            const { error } = await supabase.from('community_playlists').delete().eq('id', deleteId)
            if (error) throw error
            toast.success("Vibe deleted")
        } catch (e) {
            console.error("Error deleting:", e)
            toast.error("Failed to delete vibe")
            // Re-fetch to restore if failed
            fetchData()
        } finally {
            setIsDeleteModalOpen(false)
        }
    }

    const triggerEdit = (playlist: any) => {
        setEditData(playlist)
        setIsEditModalOpen(true)
    }

    const handleEditSuccess = (result: any) => {
        // Reload data to reflect edits
        fetchData()
        toast.success("Vibe updated successfully")
    }

    // Details Modal Logic
    const openDetails = (playlist: any, index: number, showComments: boolean = false) => {
        // Thumbnail Logic
        const firstLink = playlist.links && playlist.links.length > 0 ? playlist.links[0] : '';
        let hostname = "";
        try { hostname = new URL(firstLink).hostname.replace('www.', ''); } catch (e) { }

        let thumbnail = null;

        if (hostname.includes('spotify')) {
            thumbnail = `/thumbnails/spot${((index + 0) % 5) + 1}.png`;
        } else if (hostname.includes('amazon')) {
            const amaIndex = ((index + 0) % 4) + 1;
            thumbnail = `/thumbnails/ama${amaIndex}.png`;
        }

        setSelectedVibeId(playlist.id)
        setSelectedVibeImage(thumbnail)
        setScrollToComments(showComments)
        setIsDetailsOpen(true)
    }

    // Handle updates from Details Modal (e.g. liking/commenting inside modal)
    const handleVibeUpdate = (updatedVibe: any) => {
        setMyPosts(prev => prev.map(p => p.id === updatedVibe.id ? { ...p, ...updatedVibe } : p))
        setCommentedPlaylists(prev => prev.map(p => p.id === updatedVibe.id ? { ...p, ...updatedVibe } : p))

        // Update liked playlists if visible attributes changed
        setLikedPlaylists(prev => prev.map(p => p.id === updatedVibe.id ? { ...p, ...updatedVibe } : p))

        // Handle like toggle inside modal specifically if it affects list membership
        if (updatedVibe.is_liked === false) {
            setLikedPlaylists(current => current.filter(p => p.id !== updatedVibe.id))
        } else if (updatedVibe.is_liked === true && !likedPlaylists.find(p => p.id === updatedVibe.id)) {
            setLikedPlaylists(current => [...current, updatedVibe])
        }
    }

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // ... (keep existing helper functions) ...

    const handleCreate = () => {
        setEditData(null)
        setIsCreateModalOpen(true)
    }

    const handleCreateSuccess = (result: any) => {
        fetchData()
        toast.success("Vibe created successfully!")
    }

    // ... (keep fetchData and other handlers) ...

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>

    return (
        <div className="space-y-8">

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Chart takes 2 columns on large screens */}
                <div className="lg:col-span-2 h-full">
                    <VibeAnalytics userId={userId} />
                </div>

                {/* Stats Column */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Top Vibe Card */}
                    <div className="bg-white/60 backdrop-blur-md p-6 md:p-10 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center text-center group flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-[#FACC55]" />
                            <h3 className="text-black/60 font-bold uppercase tracking-wider text-[10px]">Top Vibe</h3>
                        </div>
                        {(() => {
                            const counts: Record<string, number> = {}
                            myPosts.forEach(p => counts[p.emotion] = (counts[p.emotion] || 0) + 1)
                            const topVibe = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

                            if (topVibe) {
                                return (
                                    <>
                                        <span className="text-2xl md:text-4xl font-black text-black mt-1 group-hover:scale-110 transition-transform duration-300 break-words w-full px-2 leading-none capitalize">
                                            {topVibe[0]}
                                        </span>
                                        <p className="text-xs text-black/50 mt-2 font-bold">Felt {topVibe[1]} times</p>
                                    </>
                                )
                            }
                            return <p className="text-black/40 italic font-medium text-sm mt-2">No vibes yet</p>
                        })()}
                    </div>

                    {/* Total Vibes Card */}
                    <div className="bg-white/60 backdrop-blur-md p-6 md:p-10 rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-center items-center text-center group flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-3 h-3 text-[#A78BFA]" />
                            <h3 className="text-black/60 font-bold uppercase tracking-wider text-xs">Total Vibes</h3>
                        </div>
                        <span className="text-3xl md:text-5xl font-black text-black mt-1 group-hover:scale-110 transition-transform duration-300">
                            {myPosts.length}
                        </span>
                        <p className="text-xs text-black/50 mt-2 font-bold">Moments shared</p>
                    </div>
                </div>
            </div>

            {/* History Tabs */}
            <Tabs defaultValue="posts" className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <TabsList className="bg-white/50 border border-black/5 p-1.5 h-auto rounded-2xl w-full sm:w-auto flex flex-col sm:flex-row gap-2 backdrop-blur-sm">
                    <TabsTrigger value="posts" className="data-[state=active]:bg-black data-[state=active]:text-white text-black/50 rounded-xl py-3 px-8 font-black uppercase tracking-wide transition-all">My Posts</TabsTrigger>
                    <TabsTrigger value="likes" className="data-[state=active]:bg-[#E34234] data-[state=active]:text-white text-black/50 rounded-xl py-3 px-8 font-black uppercase tracking-wide transition-all">My Likes</TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-[#FB58B4] data-[state=active]:text-white text-black/50 rounded-xl py-3 px-8 font-black uppercase tracking-wide transition-all">My Comments</TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-8 focus:outline-none">
                    {myPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[32px] border-2 border-black/5 border-dashed gap-6">
                            <div className="text-center space-y-2">
                                <p className="text-black/80 font-black text-2xl">No vibes yet?</p>
                                <p className="text-black/50 font-medium">Share your first musical mood with the world.</p>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="bg-[#FACC55] hover:bg-[#EAB308] text-black font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Create Vibe
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myPosts.map((playlist, idx) => (
                                <div key={playlist.id} className="h-full">
                                    <VibeCard
                                        playlist={playlist}
                                        index={idx}
                                        currentUserId={userId}
                                        onLikeToggle={handleLikeToggle}
                                        onDelete={() => triggerDelete(playlist.id)}
                                        onEdit={() => triggerEdit(playlist)}
                                        onClick={() => openDetails(playlist, idx)}
                                        onCommentClick={() => openDetails(playlist, idx, true)}
                                        onShowToast={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="likes" className="mt-8 focus:outline-none">
                    {likedPlaylists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[32px] border-2 border-black/5 border-dashed gap-6">
                            <div className="text-center space-y-2">
                                <p className="text-black/80 font-black text-2xl">No liked vibes yet?</p>
                                <p className="text-black/50 font-medium">Browse the community and show some love!</p>
                            </div>
                            <a
                                href="/community"
                                className="bg-[#E34234] hover:bg-[#D33023] text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Explore Community
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {likedPlaylists.map((playlist, idx) => (
                                <div key={playlist.id} className="h-full">
                                    <VibeCard
                                        playlist={playlist}
                                        index={idx}
                                        currentUserId={userId}
                                        onLikeToggle={handleLikeToggle}
                                        onDelete={() => { /* Can't delete other's posts */ }}
                                        onEdit={() => { /* Can't edit other's posts */ }}
                                        onClick={() => openDetails(playlist, idx)}
                                        onCommentClick={() => openDetails(playlist, idx, true)}
                                        onShowToast={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="comments" className="mt-8 focus:outline-none">
                    {commentedPlaylists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[32px] border-2 border-black/5 border-dashed gap-6">
                            <div className="text-center space-y-2">
                                <p className="text-black/80 font-black text-2xl">Quiet in here...</p>
                                <p className="text-black/50 font-medium">Explore the community and join the conversation.</p>
                            </div>
                            <a
                                href="/community"
                                className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Explore Community
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {commentedPlaylists.map((playlist, idx) => (
                                <div key={playlist.id} className="h-full">
                                    <VibeCard
                                        playlist={playlist}
                                        index={idx}
                                        currentUserId={userId}
                                        onLikeToggle={handleLikeToggle}
                                        onDelete={() => { /* Can't delete other's posts */ }}
                                        onEdit={() => { /* Can't edit other's posts */ }}
                                        onClick={() => openDetails(playlist, idx)}
                                        onCommentClick={() => openDetails(playlist, idx, true)}
                                        onShowToast={(msg, type) => type === 'error' ? toast.error(msg) : toast.success(msg)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <VibeDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false)
                    setScrollToComments(false)
                }}
                playlistId={selectedVibeId}
                selectedImage={selectedVibeImage}
                currentUserId={userId}
                onUpdate={handleVibeUpdate}
                scrollToComments={scrollToComments}
            />

            <ShareModal
                isOpen={isEditModalOpen || isCreateModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setIsCreateModalOpen(false)
                }}
                userId={userId}
                onSuccess={isEditModalOpen ? handleEditSuccess : handleCreateSuccess}
                initialData={editData}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Vibe?"
                message="Are you sure you want to remove this vibe? This action cannot be undone."
                confirmText="Delete Vibe"
                isDestructive={true}
            />
        </div>
    )
}
