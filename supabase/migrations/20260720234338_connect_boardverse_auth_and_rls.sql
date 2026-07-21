create schema if not exists private;
revoke all on schema private from public;

alter table public.users
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

alter table public.users
  alter column password drop not null;

select setval(
  'public.users_id_seq',
  greatest((select coalesce(max(id), 0) from public.users), 1),
  true
);

update public.users profile
set auth_user_id = auth_account.id
from auth.users auth_account
where lower(profile.email) = lower(auth_account.email)
  and profile.auth_user_id is null;

insert into public.users (auth_user_id, full_name, email, username)
select
  auth_account.id,
  coalesce(
    nullif(auth_account.raw_user_meta_data ->> 'full_name', ''),
    split_part(auth_account.email, '@', 1)
  ),
  auth_account.email,
  coalesce(
    nullif(auth_account.raw_user_meta_data ->> 'username', ''),
    'player_' || substr(auth_account.id::text, 1, 8)
  )
from auth.users auth_account
where auth_account.email is not null
on conflict (email) do update
set auth_user_id = excluded.auth_user_id;

create unique index if not exists users_auth_user_id_key
  on public.users (auth_user_id)
  where auth_user_id is not null;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (auth_user_id, full_name, email, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      'player_' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (email) do update
  set auth_user_id = excluded.auth_user_id;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_completed enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.games enable row level security;
alter table public.game_moves enable row level security;
alter table public.messages enable row level security;

revoke all on table
  public.users,
  public.challenges,
  public.challenge_completed,
  public.friend_requests,
  public.friendships,
  public.games,
  public.game_moves,
  public.messages
from anon, authenticated;

revoke all on all sequences in schema public from anon, authenticated;

grant select on public.challenges to anon, authenticated;

grant select (
  id, auth_user_id, full_name, created_at, avatar, username, bio, location,
  birthdate, notifications_email, notifications_app, newsletter, game_invites,
  friend_requests, profile_visibility, show_online_status, show_play_history,
  allow_friend_requests, language, theme, color_blind_mode, text_size, last_seen
) on public.users to authenticated;

grant update (
  full_name, username, avatar, bio, location, birthdate, notifications_email,
  notifications_app, newsletter, game_invites, friend_requests,
  profile_visibility, show_online_status, show_play_history,
  allow_friend_requests, language, theme, color_blind_mode, text_size, last_seen
) on public.users to authenticated;

grant select, insert, delete on public.challenge_completed to authenticated;
grant select, insert, delete on public.friend_requests to authenticated;
grant select, insert, delete on public.friendships to authenticated;
grant select, insert on public.games to authenticated;
grant update (
  guest_id, status, white_time_remaining, black_time_remaining, winner_id, result
) on public.games to authenticated;
grant select, insert on public.game_moves to authenticated;
grant select, insert on public.messages to authenticated;
grant update (text, unread, sent_at) on public.messages to authenticated;

grant usage, select on sequence public.friend_requests_id_seq to authenticated;
grant usage, select on sequence public.friendships_id_seq to authenticated;
grant usage, select on sequence public.game_moves_id_seq to authenticated;
grant usage, select on sequence public.messages_id_seq to authenticated;

drop policy if exists users_select_authenticated on public.users;
create policy users_select_authenticated on public.users
for select to authenticated
using (true);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update to authenticated
using (auth_user_id = (select auth.uid()))
with check (auth_user_id = (select auth.uid()));

drop policy if exists challenges_read_public on public.challenges;
create policy challenges_read_public on public.challenges
for select to anon, authenticated
using (true);

drop policy if exists challenge_completed_select_own on public.challenge_completed;
create policy challenge_completed_select_own on public.challenge_completed
for select to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists challenge_completed_insert_own on public.challenge_completed;
create policy challenge_completed_insert_own on public.challenge_completed
for insert to authenticated
with check (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists challenge_completed_delete_own on public.challenge_completed;
create policy challenge_completed_delete_own on public.challenge_completed
for delete to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists friend_requests_select_participant on public.friend_requests;
create policy friend_requests_select_participant on public.friend_requests
for select to authenticated
using (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or receiver_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists friend_requests_insert_sender on public.friend_requests;
create policy friend_requests_insert_sender on public.friend_requests
for insert to authenticated
with check (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and receiver_id <> sender_id
  and exists (select 1 from public.users receiver where receiver.id = receiver_id)
);

drop policy if exists friend_requests_delete_participant on public.friend_requests;
create policy friend_requests_delete_participant on public.friend_requests
for delete to authenticated
using (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or receiver_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists friendships_select_participant on public.friendships;
create policy friendships_select_participant on public.friendships
for select to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or friend_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists friendships_insert_recipient on public.friendships;
create policy friendships_insert_recipient on public.friendships
for insert to authenticated
with check (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1
    from public.friend_requests request
    where request.sender_id = friend_id
      and request.receiver_id = user_id
  )
);

drop policy if exists friendships_delete_participant on public.friendships;
create policy friendships_delete_participant on public.friendships
for delete to authenticated
using (
  user_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or friend_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists games_select_authenticated on public.games;
create policy games_select_authenticated on public.games
for select to authenticated
using (true);

drop policy if exists games_insert_host on public.games;
create policy games_insert_host on public.games
for insert to authenticated
with check (
  host_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and guest_id is null
);

drop policy if exists games_update_participant_or_join on public.games;
create policy games_update_participant_or_join on public.games
for update to authenticated
using (
  host_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or guest_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or (guest_id is null and status = 'waiting')
)
with check (
  host_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or guest_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists game_moves_select_participants on public.game_moves;
create policy game_moves_select_participants on public.game_moves
for select to authenticated
using (
  exists (
    select 1
    from public.games game
    join public.users current_profile
      on current_profile.auth_user_id = (select auth.uid())
    where game.id = game_moves.game_id
      and current_profile.id in (game.host_id, game.guest_id)
  )
);

drop policy if exists game_moves_insert_participant on public.game_moves;
create policy game_moves_insert_participant on public.game_moves
for insert to authenticated
with check (
  moved_by = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1
    from public.games game
    where game.id = game_moves.game_id
      and moved_by in (game.host_id, game.guest_id)
  )
);

drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant on public.messages
for select to authenticated
using (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or receiver_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);

drop policy if exists messages_insert_sender on public.messages;
create policy messages_insert_sender on public.messages
for insert to authenticated
with check (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  and exists (
    select 1
    from public.friendships friendship
    where (friendship.user_id = sender_id and friendship.friend_id = receiver_id)
       or (friendship.user_id = receiver_id and friendship.friend_id = sender_id)
  )
);

drop policy if exists messages_update_participant on public.messages;
create policy messages_update_participant on public.messages
for update to authenticated
using (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or receiver_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
)
with check (
  sender_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
  or receiver_id = (select u.id from public.users u where u.auth_user_id = (select auth.uid()))
);
