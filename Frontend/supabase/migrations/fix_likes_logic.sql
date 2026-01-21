-- 1. Constraint: Ensure one like per user per playlist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_playlist_like') THEN
        ALTER TABLE likes DROP CONSTRAINT unique_user_playlist_like;
    END IF;
END $$;

ALTER TABLE likes
ADD CONSTRAINT unique_user_playlist_like UNIQUE (user_id, playlist_id);

-- 2. RLS Policies: Security
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;
DROP POLICY IF EXISTS "Users can view all likes" ON likes;

-- Allow users to insert THEIR OWN likes
CREATE POLICY "Users can insert their own likes" ON likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete THEIR OWN likes
CREATE POLICY "Users can delete their own likes" ON likes
FOR DELETE USING (auth.uid() = user_id);

-- Allow everyone to read likes (needed for mapping "is_liked")
CREATE POLICY "Users can view all likes" ON likes
FOR SELECT USING (true);

-- 3. Functions for Triggers
CREATE OR REPLACE FUNCTION handle_like_increment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_playlists
  SET likes = likes + 1
  WHERE id = NEW.playlist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_like_decrement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_playlists
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = OLD.playlist_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers: Automate the counting
DROP TRIGGER IF EXISTS on_like_added ON likes;
CREATE TRIGGER on_like_added
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE PROCEDURE handle_like_increment();

DROP TRIGGER IF EXISTS on_like_removed ON likes;
CREATE TRIGGER on_like_removed
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE PROCEDURE handle_like_decrement();
