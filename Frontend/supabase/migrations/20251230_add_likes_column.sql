-- Add 'likes' column if it doesn't exist
alter table community_playlists
add column if not exists likes integer default 0;

-- Optional: Recalculate likes from playlist_likes table (in case of desync or backfill)
with counts as (
  select playlist_id, count(*) as count
  from playlist_likes
  group by playlist_id
)
update community_playlists
set likes = counts.count
from counts
where community_playlists.id = counts.playlist_id;
