-- 1. Create the likes table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    playlist_id UUID REFERENCES public.community_playlists(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, playlist_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts (optional/safe)
DROP POLICY IF EXISTS "Users can view their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Public can view likes" ON public.likes;

-- 4. Create new policies

-- Allow users to see their own likes (Critical for Vibe Dashboard)
CREATE POLICY "Users can view their own likes"
ON public.likes FOR SELECT
USING ( auth.uid() = user_id );

-- Allow users to add likes
CREATE POLICY "Users can create their own likes"
ON public.likes FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- Allow users to remove their likes
CREATE POLICY "Users can delete their own likes"
ON public.likes FOR DELETE
USING ( auth.uid() = user_id );

-- 5. Ensure Community Playlists are readable
-- (You likely already have this, but just in case)
ALTER TABLE public.community_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community playlists"
ON public.community_playlists FOR SELECT
USING ( true );
