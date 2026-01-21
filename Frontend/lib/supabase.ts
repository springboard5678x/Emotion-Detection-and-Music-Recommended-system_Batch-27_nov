
import { createClient } from '@/utils/supabase/client';
import { isValidMusicLink } from './validators';

export async function updateCustomPlaylist(playlistId: string, emotion: string, links: string[], tagline?: string) {
    const supabase = createClient();

    // Validate
    const allValid = links.every(link => isValidMusicLink(link));
    if (!allValid) throw new Error("One or more links are from unsupported platforms.");

    const { data, error } = await supabase
        .from('community_playlists')
        .update({ emotion, links, tagline })
        .eq('id', playlistId)
        .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Update failed or permission denied.");

    return data[0];
}

export async function shareCustomPlaylist(userId: string, emotion: string, links: string[], tagline?: string) {
    const supabase = createClient();

    // 1. Check Limits (Frontend/Edge Enforcement)
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to 1st of the month
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
        .from('community_playlists')
        .select('*', { count: 'exact', head: true }) // 'head' means don't fetch data, just count
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

    if (countError) {
        console.error("Error checking limits:", countError);
        throw new Error("Failed to check monthly limits.");
    }

    if (count !== null && count >= 5) {
        throw new Error("You have reached your monthly limit of 5 shares!");
    }

    // 2. Validate Links (Double check)
    const allValid = links.every(link => isValidMusicLink(link));
    if (!allValid) {
        throw new Error("One or more links are from unsupported platforms.");
    }

    // 3. Insert if safe
    const { data, error } = await supabase
        .from('community_playlists')
        .insert([{ user_id: userId, emotion: emotion, links: links, tagline: tagline }])
        .select();

    if (error) {
        console.error("Error inserting playlist:", error);
        throw error;
    }

    return { data, error };
}

export async function toggleLike(userId: string, playlistId: string) {
    const supabase = createClient();

    // Check if already liked
    const { data: existing } = await supabase
        .from('playlist_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('playlist_id', playlistId)
        .eq('user_id', userId)
        .eq('playlist_id', playlistId)
        .maybeSingle();

    if (existing) {
        // Unlike
        const { error } = await supabase
            .from('playlist_likes')
            .delete()
            .eq('id', existing.id);
        if (error) throw error;
        return false; // Liked = false
    } else {
        // Like
        const { error } = await supabase
            .from('playlist_likes')
            .insert([{ user_id: userId, playlist_id: playlistId }]);
        if (error) throw error;
        return true; // Liked = true
    }
}

export async function deletePlaylist(playlistId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('community_playlists')
        .delete()
        .eq('id', playlistId);

    if (error) throw error;
}

export async function getCommunityPlaylists(currentUserId?: string, sortBy: 'Latest' | 'Popular' | 'Trending' = 'Latest') {
    const supabase = createClient();

    // 1. Fetch Playlists with Counts
    // We fetch a larger batch to sort client-side since relation sorting is complex
    const { data: playlists, error: playlistError } = await supabase
        .from('community_playlists')
        .select(`
            *,
            playlist_likes(count),
            comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    if (playlistError) {
        return { data: null, error: playlistError };
    }

    if (!playlists || playlists.length === 0) {
        return { data: [], error: null };
    }

    // 2. Extract User IDs
    const userIds = Array.from(new Set(playlists.map(p => p.user_id)));

    // 3. Fetch Profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    }

    // 4. Fetch User's Likes (if logged in)
    let likedPlaylistIds = new Set<string>();
    if (currentUserId) {
        const { data: likes } = await supabase
            .from('playlist_likes')
            .select('playlist_id')
            .eq('user_id', currentUserId)
            .in('playlist_id', playlists.map(p => p.id));

        if (likes) {
            likes.forEach(l => likedPlaylistIds.add(l.playlist_id));
        }
    }

    // 5. Merge & Sort
    const profilesMap = new Map(profiles?.map(p => [p.id, p]));

    let mergedData = playlists.map(p => ({
        ...p,
        profile: profilesMap.get(p.user_id) || null,
        is_liked: likedPlaylistIds.has(p.id),
        likes: p.playlist_likes?.[0]?.count || 0,
        comments: p.comments?.[0]?.count || 0
    }));

    // Client-side Sort
    if (sortBy === 'Popular') {
        mergedData.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'Trending') {
        mergedData.sort((a, b) => b.comments - a.comments);
    }
    // 'Latest' is already sorted by created_at desc from query

    return { data: mergedData, error: null };
}

// --- Vibe Details & Comments ---

export async function getVibeById(playlistId: string, currentUserId?: string) {
    const supabase = createClient();

    // 1. Fetch Playlist
    const { data: playlist, error } = await supabase
        .from('community_playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

    if (error) return { data: null, error };

    // 2. Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', playlist.user_id)
        .single();

    // 3. Check Like Status
    let isLiked = false;
    if (currentUserId) {
        const { data: like } = await supabase
            .from('playlist_likes')
            .select('id')
            .eq('playlist_id', playlistId)
            .eq('user_id', currentUserId)
            .maybeSingle();
        if (like) isLiked = true;
    }

    return {
        data: {
            ...playlist,
            profile,
            is_liked: isLiked
        },
        error: null
    };
}

// --- Comment Features ---

export async function getComments(playlistId: string, currentUserId?: string) {
    const supabase = createClient();

    const { data: comments, error } = await supabase
        .from('comments')
        .select(`
            *,
            profile:profiles(id, full_name, avatar_url)
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: true });

    if (error) return { data: null, error };

    let enrichedComments = comments;

    // Check Liked Status if user is logged in
    if (currentUserId && comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        const { data: likes } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', currentUserId)
            .in('comment_id', commentIds);

        const likedSet = new Set(likes?.map(l => l.comment_id));
        enrichedComments = comments.map(c => ({
            ...c,
            is_liked: likedSet.has(c.id)
        }));
    }

    return { data: enrichedComments, error: null };
}

export async function postComment(playlistId: string, userId: string, content: string, parentId?: string) {
    const supabase = createClient();

    const payload: any = { playlist_id: playlistId, user_id: userId, content };
    if (parentId) payload.parent_id = parentId;

    const { data, error } = await supabase
        .from('comments')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    return { data, error: null };
}

export async function deleteComment(commentId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
    if (error) throw error;
}

export async function toggleCommentLike(userId: string, commentId: string) {
    const supabase = createClient();

    // Check if already liked
    const { data: existing } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('comment_id', commentId)
        .maybeSingle();

    if (existing) {
        // Unlike
        await supabase.from('comment_likes').delete().eq('id', existing.id);
    } else {
        // Like
        await supabase.from('comment_likes').insert([{ user_id: userId, comment_id: commentId }]);
    }
}
