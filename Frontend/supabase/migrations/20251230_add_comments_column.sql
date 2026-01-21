-- Add comments count column to community_playlists
alter table public.community_playlists
add column if not exists comments integer default 0;

-- Optional: Backfill existing counts
update public.community_playlists cp
set comments = (
  select count(*)
  from public.comments c
  where c.playlist_id = cp.id
);
