-- Create the table
create table community_playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  emotion text not null,
  links text[] not null,
  created_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table community_playlists enable row level security;

-- Policy 1: View (Read access for everyone)
create policy "Enable read access for all users"
on community_playlists for select
using (true);

-- Policy 2: Insert (Authenticated users only)
create policy "Enable insert for authenticated users only"
on community_playlists for insert
with check (auth.uid() = user_id);

-- Policy 3: Delete (Owner only)
create policy "Enable delete for users based on user_id"
on community_playlists for delete
using (auth.uid() = user_id);


-- Function to check monthly limit (Optional: if enforcing at DB level)
create or replace function check_monthly_limit(user_uuid uuid)
returns boolean as $$
declare
  post_count int;
begin
  select count(*)
  into post_count
  from community_playlists
  where user_id = user_uuid
  and created_at >= date_trunc('month', current_date); -- Start of current month

  if post_count >= 5 then
    return false; -- Limit reached
  else
    return true; -- Good to go
  end if;
end;
$$ language plpgsql;
