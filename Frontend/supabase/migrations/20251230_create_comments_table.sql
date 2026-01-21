-- 1. Create Comments Table
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references public.community_playlists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null
);

-- 2. Enable RLS
alter table public.comments enable row level security;

-- Drop existing policies to ensure clean state
drop policy if exists "Comments are public" on public.comments;
drop policy if exists "Authenticated users can comment" on public.comments;
drop policy if exists "Users can delete own comments" on public.comments;

-- Policy: Everyone can view comments
create policy "Comments are public"
  on public.comments for select
  using ( true );

-- Policy: Authenticated users can comment
create policy "Authenticated users can comment"
  on public.comments for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can delete their own comments
create policy "Users can delete own comments"
  on public.comments for delete
  using ( auth.uid() = user_id );

-- 3. Trigger to Update Comments Count
create or replace function public.handle_comments_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.community_playlists
    set comments = comments + 1
    where id = new.playlist_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.community_playlists
    set comments = comments - 1
    where id = old.playlist_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Bind Trigger
drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure public.handle_comments_count();
