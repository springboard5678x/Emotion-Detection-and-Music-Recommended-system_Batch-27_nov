-- 1. Add parent_id for threads (replies)
alter table public.comments
add column if not exists parent_id uuid references public.comments(id) on delete cascade;

-- 2. Add likes_count to comments
alter table public.comments
add column if not exists likes_count integer default 0;

-- 3. Create Comment Likes table
create table if not exists public.comment_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  comment_id uuid references public.comments(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, comment_id)
);

-- 4. RLS for Comment Likes
alter table public.comment_likes enable row level security;

-- Drop exist policies if any (idempotent)
drop policy if exists "Comment likes are public" on public.comment_likes;
drop policy if exists "Authenticated users can like comments" on public.comment_likes;
drop policy if exists "Users can unlike comments" on public.comment_likes;

create policy "Comment likes are public"
  on public.comment_likes for select
  using ( true );

create policy "Authenticated users can like comments"
  on public.comment_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can unlike comments"
  on public.comment_likes for delete
  using ( auth.uid() = user_id );

-- 5. Trigger for Comment Likes Count
create or replace function public.handle_comment_likes_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.comments
    set likes_count = likes_count + 1
    where id = new.comment_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.comments
    set likes_count = likes_count - 1
    where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_like_change on public.comment_likes;
create trigger on_comment_like_change
  after insert or delete on public.comment_likes
  for each row execute procedure public.handle_comment_likes_count();
