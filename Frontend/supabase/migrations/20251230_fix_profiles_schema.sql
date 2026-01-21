-- Force add columns if they are missing
alter table public.profiles 
add column if not exists full_name text,
add column if not exists avatar_url text;

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Re-apply policies (drop first to avoid errors if they exist)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Ensure trigger function exists with correct logic
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update
  set full_name = excluded.full_name,
      avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;
