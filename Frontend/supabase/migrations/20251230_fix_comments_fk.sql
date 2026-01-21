-- Drop the existing foreign key to auth.users
alter table public.comments
drop constraint comments_user_id_fkey;

-- Add new foreign key to public.profiles
alter table public.comments
add constraint comments_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete cascade;
