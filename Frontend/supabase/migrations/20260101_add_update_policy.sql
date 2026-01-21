-- Policy 4: Update (Owner only)
create policy "Enable update for users based on user_id"
on community_playlists for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
