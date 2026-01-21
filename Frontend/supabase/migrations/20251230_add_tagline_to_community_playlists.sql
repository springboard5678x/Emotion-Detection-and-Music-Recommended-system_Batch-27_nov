-- Add column if it doesn't exist
alter table community_playlists
add column if not exists tagline text;

-- Drop the constraint if it exists (so we can update it)
alter table community_playlists
drop constraint if exists community_playlists_tagline_check;

-- Add the constraint with the new limit of 60
alter table community_playlists
add constraint community_playlists_tagline_check check (char_length(tagline) <= 60);
