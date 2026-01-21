-- 1. Create Likes Table
create table if not exists public.playlist_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  playlist_id uuid references public.community_playlists(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, playlist_id) -- Prevent double liking
);

-- 2. Enable RLS
alter table public.playlist_likes enable row level security;

-- Policy: Allow users to like (insert)
create policy "Users can like playlists"
  on public.playlist_likes for insert
  with check ( auth.uid() = user_id );

-- Policy: Allow users to unlike (delete)
create policy "Users can unlike playlists"
  on public.playlist_likes for delete
  using ( auth.uid() = user_id );

-- Policy: Everyone can see who liked what (Optional, but good for "is_liked" check)
create policy "Public view of likes"
  on public.playlist_likes for select
  using ( true );


-- 3. Trigger to Update Likes Count
create or replace function public.handle_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.community_playlists
    set likes = likes + 1
    where id = new.playlist_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.community_playlists
    set likes = likes - 1
    where id = old.playlist_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Bind Trigger
create or replace trigger on_like_toggle
  after insert or delete on public.playlist_likes
  for each row execute procedure public.handle_likes_count();
