-- Run this to populate profiles for ALL existing users
insert into public.profiles (id, full_name, avatar_url, updated_at)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', raw_user_meta_data->>'display_name', 'Anonymous') as full_name,
  coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', '') as avatar_url,
  now()
from auth.users
on conflict (id) do update
set 
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

-- Verify the count
select count(*) as profile_count from public.profiles;
